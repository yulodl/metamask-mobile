import {
	AccountTrackerController,
	AddressBookController,
	AssetsContractController,
	AssetsDetectionController,
	ControllerMessenger,
	ComposableController,
	CurrencyRateController,
	KeyringController,
	PersonalMessageManager,
	MessageManager,
	NetworkController,
	PhishingController,
	PreferencesController,
	TokenBalancesController,
	TokenRatesController,
	TransactionController,
	TypedMessageManager,
	WalletDevice,
	GasFeeController,
	TokensController,
	CollectiblesController
} from '@metamask/controllers';

import SwapsController, { swapsUtils } from '@metamask/swaps-controller';

import AsyncStorage from '@react-native-community/async-storage';
import Encryptor from './Encryptor';
import { toChecksumAddress } from 'ethereumjs-util';
import Networks, { isMainnetByChainId } from '../util/networks';
import AppConstants from './AppConstants';
import { store } from '../store';
import { renderFromTokenMinimalUnit, balanceToFiatNumber, weiToFiatNumber } from '../util/number';
import NotificationManager from './NotificationManager';
import contractMap from '@metamask/contract-metadata';
import Logger from '../util/Logger';
import { LAST_INCOMING_TX_BLOCK_INFO } from '../constants/storage';

const NON_EMPTY = 'NON_EMPTY';

const encryptor = new Encryptor();
let currentChainId;

/**
 * Core controller responsible for composing other metamask controllers together
 * and exposing convenience methods for common wallet operations.
 */
class Engine {
	/**
	 * ComposableController reference containing all child controllers
	 */
	datamodel;

	/**
	 * Object containing the info for the latest incoming tx block
	 * for each address and network
	 */
	lastIncomingTxBlockInfo;

	/**
	 * Creates a CoreController instance
	 */
	constructor(initialState = {}) {
		if (!Engine.instance) {
			const preferencesController = new PreferencesController(
				{},
				{
					ipfsGateway: AppConstants.IPFS_DEFAULT_GATEWAY_URL
				}
			);
			const networkController = new NetworkController({
				infuraProjectId: process.env.MM_INFURA_PROJECT_ID || NON_EMPTY,
				providerConfig: {
					static: {
						eth_sendTransaction: async (payload, next, end) => {
							const { TransactionController } = this.context;
							try {
								const hash = await (await TransactionController.addTransaction(
									payload.params[0],
									payload.origin,
									WalletDevice.MM_MOBILE
								)).result;
								end(undefined, hash);
							} catch (error) {
								end(error);
							}
						}
					},
					getAccounts: (end, payload) => {
						const { approvedHosts, privacyMode } = store.getState();
						const isEnabled = !privacyMode || approvedHosts[payload.hostname];
						const { KeyringController } = this.context;
						const isUnlocked = KeyringController.isUnlocked();
						const selectedAddress = this.context.PreferencesController.state.selectedAddress;
						end(null, isUnlocked && isEnabled && selectedAddress ? [selectedAddress] : []);
					}
				}
			});
			const assetsContractController = new AssetsContractController();
			const collectiblesController = new CollectiblesController({
				onPreferencesStateChange: listener => preferencesController.subscribe(listener),
				onNetworkStateChange: listener => networkController.subscribe(listener),
				getAssetName: assetsContractController.getAssetName.bind(assetsContractController),
				getAssetSymbol: assetsContractController.getAssetSymbol.bind(assetsContractController),
				getCollectibleTokenURI: assetsContractController.getCollectibleTokenURI.bind(assetsContractController)
			});

			const tokensController = new TokensController({
				onPreferencesStateChange: listener => preferencesController.subscribe(listener),
				onNetworkStateChange: listener => networkController.subscribe(listener),
				config: { provider: networkController.provider }
			});
			this.controllerMessenger = new ControllerMessenger();
			const currencyRateController = new CurrencyRateController({
				messenger: this.controllerMessenger,
				state: initialState.CurrencyRateController
			});
			currencyRateController.start();

			const gasFeeController = new GasFeeController({
				messenger: this.controllerMessenger,
				getProvider: () => networkController.provider,
				onNetworkStateChange: listener => networkController.subscribe(listener),
				getCurrentNetworkEIP1559Compatibility: async () => await networkController.getEIP1559Compatibility(),
				getChainId: () => networkController.state.provider.chainId,
				getCurrentNetworkLegacyGasAPICompatibility: () =>
					isMainnetByChainId(networkController.state.provider.chainId) ||
					networkController.state.provider.chainId === swapsUtils.BSC_CHAIN_ID,
				legacyAPIEndpoint: 'https://gas-api.metaswap.codefi.network/networks/<chain_id>/gasPrices',
				EIP1559APIEndpoint: 'https://gas-api.metaswap.codefi.network/networks/<chain_id>/suggestedGasFees'
			});

			const controllers = [
				new KeyringController(
					{
						removeIdentity: preferencesController.removeIdentity.bind(preferencesController),
						syncIdentities: preferencesController.syncIdentities.bind(preferencesController),
						updateIdentities: preferencesController.updateIdentities.bind(preferencesController),
						setSelectedAddress: preferencesController.setSelectedAddress.bind(preferencesController)
					},
					{ encryptor },
					initialState.KeyringController
				),
				new AccountTrackerController({
					onPreferencesStateChange: listener => preferencesController.subscribe(listener),
					getIdentities: () => preferencesController.state.identities
				}),
				new AddressBookController(),
				assetsContractController,
				collectiblesController,
				tokensController,
				new AssetsDetectionController({
					onCollectiblesStateChange: listener => collectiblesController.subscribe(listener),
					onTokensStateChange: listener => tokensController.subscribe(listener),
					onPreferencesStateChange: listener => preferencesController.subscribe(listener),
					onNetworkStateChange: listener => networkController.subscribe(listener),
					getOpenSeaApiKey: () => collectiblesController.openSeaApiKey,
					getBalancesInSingleCall: assetsContractController.getBalancesInSingleCall.bind(
						assetsContractController
					),
					addTokens: tokensController.addTokens.bind(tokensController),
					addCollectible: collectiblesController.addCollectible.bind(collectiblesController),
					getCollectiblesState: () => collectiblesController.state,
					getTokensState: () => tokensController.state,
					getTokenListState: () => {
						const tokenList = Object.entries(contractMap).reduce((final, [key, value]) => {
							if (value.erc20) {
								final[key] = value;
							}
							return final;
						}, {});
						return { tokenList };
					}
				}),
				currencyRateController,
				new PersonalMessageManager(),
				new MessageManager(),
				networkController,
				new PhishingController(),
				preferencesController,
				new TokenBalancesController(
					{
						onTokensStateChange: listener => tokensController.subscribe(listener),
						getSelectedAddress: () => preferencesController.state.selectedAddress,
						getBalanceOf: assetsContractController.getBalanceOf.bind(assetsContractController)
					},
					{ interval: 10000 }
				),
				new TokenRatesController({
					onTokensStateChange: listener => tokensController.subscribe(listener),
					onCurrencyRateStateChange: listener =>
						this.controllerMessenger.subscribe(`${currencyRateController.name}:stateChange`, listener),
					onNetworkStateChange: listener => networkController.subscribe(listener)
				}),
				new TransactionController({
					getNetworkState: () => networkController.state,
					onNetworkStateChange: listener => networkController.subscribe(listener),
					getProvider: () => networkController.provider
				}),
				new TypedMessageManager(),
				new SwapsController({
					clientId: AppConstants.SWAPS.CLIENT_ID,
					fetchAggregatorMetadataThreshold: AppConstants.SWAPS.CACHE_AGGREGATOR_METADATA_THRESHOLD,
					fetchTokensThreshold: AppConstants.SWAPS.CACHE_TOKENS_THRESHOLD,
					fetchTopAssetsThreshold: AppConstants.SWAPS.CACHE_TOP_ASSETS_THRESHOLD,
					fetchGasFeeEstimates: () => gasFeeController.fetchGasFeeEstimates()
				}),
				gasFeeController
			];
			// set initial state
			// TODO: Pass initial state into each controller constructor instead
			// This is being set post-construction for now to ensure it's functionally equivalent with
			// how the `ComponsedController` used to set initial state.
			//
			// The check for `controller.subscribe !== undefined` is to filter out BaseControllerV2
			// controllers. They should be initialized via the constructor instead.
			for (const controller of controllers) {
				if (initialState[controller.name] && controller.subscribe !== undefined) {
					controller.update(initialState[controller.name]);
				}
			}
			this.datamodel = new ComposableController(controllers, this.controllerMessenger);
			this.context = controllers.reduce((context, controller) => {
				context[controller.name] = controller;
				return context;
			}, {});

			const {
				CollectiblesController: collectibles,
				KeyringController: keyring,
				NetworkController: network,
				TransactionController: transaction
			} = this.context;

			collectibles.setApiKey(process.env.MM_OPENSEA_KEY);
			network.refreshNetwork();
			transaction.configure({ sign: keyring.signTransaction.bind(keyring) });
			network.subscribe(state => {
				if (state.network !== 'loading' && state.provider.chainId !== currentChainId) {
					// We should add a state or event emitter saying the provider changed
					setTimeout(() => {
						this.configureControllersOnNetworkChange();
						currentChainId = state.provider.chainId;
					}, 500);
				}
			});
			this.configureControllersOnNetworkChange();
			Engine.instance = this;
		}
		return Engine.instance;
	}

	configureControllersOnNetworkChange() {
		const {
			AccountTrackerController,
			AssetsContractController,
			AssetsDetectionController,
			NetworkController: { provider, state: NetworkControllerState },
			TransactionController,
			SwapsController
		} = this.context;

		provider.sendAsync = provider.sendAsync.bind(provider);
		AccountTrackerController.configure({ provider });
		AssetsContractController.configure({ provider });

		SwapsController.configure({
			provider,
			chainId: NetworkControllerState?.provider?.chainId,
			pollCountLimit: AppConstants.SWAPS.POLL_COUNT_LIMIT,
			quotePollingInterval: AppConstants.SWAPS.POLLING_INTERVAL
		});
		TransactionController.configure({ provider });
		TransactionController.hub.emit('networkChange');
		AssetsDetectionController.detectAssets();
		AccountTrackerController.refresh();
	}

	refreshTransactionHistory = async forceCheck => {
		const { TransactionController, PreferencesController, NetworkController } = this.context;
		const { selectedAddress } = PreferencesController.state;
		const { type: networkType } = NetworkController.state.provider;
		const { networkId } = Networks[networkType];
		try {
			const lastIncomingTxBlockInfoStr = await AsyncStorage.getItem(LAST_INCOMING_TX_BLOCK_INFO);
			const allLastIncomingTxBlocks =
				(lastIncomingTxBlockInfoStr && JSON.parse(lastIncomingTxBlockInfoStr)) || {};
			let blockNumber = null;
			if (
				allLastIncomingTxBlocks[`${selectedAddress}`] &&
				allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`]
			) {
				blockNumber = allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`].blockNumber;
				// Let's make sure we're not doing this too often...
				const timeSinceLastCheck = allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`].lastCheck;
				const delta = Date.now() - timeSinceLastCheck;
				if (delta < AppConstants.TX_CHECK_MAX_FREQUENCY && !forceCheck) {
					return false;
				}
			} else {
				allLastIncomingTxBlocks[`${selectedAddress}`] = {};
			}
			//Fetch txs and get the new lastIncomingTxBlock number
			const newlastIncomingTxBlock = await TransactionController.fetchAll(selectedAddress, {
				blockNumber,
				etherscanApiKey: process.env.MM_ETHERSCAN_KEY
			});
			// Check if it's a newer block and store it so next time we ask for the newer txs only
			if (
				allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`] &&
				allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`].blockNumber !== newlastIncomingTxBlock &&
				newlastIncomingTxBlock &&
				newlastIncomingTxBlock !== blockNumber
			) {
				allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`] = {
					blockNumber: newlastIncomingTxBlock,
					lastCheck: Date.now()
				};

				NotificationManager.gotIncomingTransaction(newlastIncomingTxBlock);
			} else {
				allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`] = {
					...allLastIncomingTxBlocks[`${selectedAddress}`][`${networkId}`],
					lastCheck: Date.now()
				};
			}
			await AsyncStorage.setItem(LAST_INCOMING_TX_BLOCK_INFO, JSON.stringify(allLastIncomingTxBlocks));
		} catch (e) {
			// Logger.log('Error while fetching all txs', e);
		}
	};

	getTotalFiatAccountBalance = () => {
		const {
			CurrencyRateController,
			PreferencesController,
			AccountTrackerController,
			TokenBalancesController,
			TokenRatesController,
			TokensController
		} = this.context;
		const { selectedAddress } = PreferencesController.state;
		const { currentCurrency } = CurrencyRateController.state;
		const conversionRate =
			CurrencyRateController.state.conversionRate === null ? 0 : CurrencyRateController.state.conversionRate;
		const { accounts } = AccountTrackerController.state;
		const { tokens } = TokensController.state;
		let ethFiat = 0;
		let tokenFiat = 0;
		const decimalsToShow = (currentCurrency === 'usd' && 2) || undefined;
		if (accounts[selectedAddress]) {
			ethFiat = weiToFiatNumber(accounts[selectedAddress].balance, conversionRate, decimalsToShow);
		}
		if (tokens.length > 0) {
			const { contractBalances: tokenBalances } = TokenBalancesController.state;
			const { contractExchangeRates: tokenExchangeRates } = TokenRatesController.state;
			tokens.forEach(item => {
				const exchangeRate = item.address in tokenExchangeRates ? tokenExchangeRates[item.address] : undefined;
				const tokenBalance =
					item.balance ||
					(item.address in tokenBalances
						? renderFromTokenMinimalUnit(tokenBalances[item.address], item.decimals)
						: undefined);
				const tokenBalanceFiat = balanceToFiatNumber(
					tokenBalance,
					conversionRate,
					exchangeRate,
					decimalsToShow
				);
				tokenFiat += tokenBalanceFiat;
			});
		}

		const total = ethFiat + tokenFiat;
		return total;
	};

	/**
	 * Returns true or false whether the user has funds or not
	 */
	hasFunds = () => {
		try {
			const {
				engine: { backgroundState }
			} = store.getState();
			const collectibles = backgroundState.CollectiblesController.collectibles;
			const tokens = backgroundState.TokensController.tokens;
			const tokenBalances = backgroundState.TokenBalancesController.contractBalances;

			let tokenFound = false;
			tokens.forEach(token => {
				if (tokenBalances[token.address] && !tokenBalances[token.address]?.isZero()) {
					tokenFound = true;
				}
			});

			const fiatBalance = this.getTotalFiatAccountBalance();

			return fiatBalance > 0 || tokenFound || collectibles.length > 0;
		} catch (e) {
			Logger.log('Error while getting user funds', e);
		}
	};

	resetState = async () => {
		// Whenever we are gonna start a new wallet
		// either imported or created, we need to
		// get rid of the old data from state
		const {
			TransactionController,
			CollectiblesController,
			TokenBalancesController,
			TokenRatesController,
			TokensController
		} = this.context;

		//Clear assets info
		CollectiblesController.update({
			allCollectibleContracts: {},
			allCollectibles: {},
			collectibleContracts: [],
			collectibles: [],
			ignoredCollectibles: []
		});

		TokensController.update({
			allTokens: {},
			ignoredTokens: [],
			tokens: [],
			suggestedAssets: []
		});

		TokenBalancesController.update({ contractBalances: {} });
		TokenRatesController.update({ contractExchangeRates: {} });

		TransactionController.update({
			internalTransactions: [],
			swapsTransactions: {},
			methodData: {},
			transactions: []
		});
	};

	sync = async ({ accounts, preferences, network, transactions, seed, pass, importedAccounts }) => {
		const {
			KeyringController,
			PreferencesController,
			NetworkController,
			TransactionController,
			TokensController
		} = this.context;

		// Select same network ?
		await NetworkController.setProviderType(network.provider.type);

		// Recreate accounts
		await KeyringController.createNewVaultAndRestore(pass, seed);
		for (let i = 0; i < accounts.hd.length - 1; i++) {
			await KeyringController.addNewAccount();
		}

		// Recreate imported accounts
		if (importedAccounts) {
			for (let i = 0; i < importedAccounts.length; i++) {
				await KeyringController.importAccountWithStrategy('privateKey', [importedAccounts[i]]);
			}
		}
		// Sync tokens
		const allTokens = {};
		Object.keys(preferences.accountTokens).forEach(address => {
			const checksummedAddress = toChecksumAddress(address);
			allTokens[checksummedAddress] = {};
			Object.keys(preferences.accountTokens[address]).forEach(chainId => {
				const network = Object.values(Networks).find(
					({ hexChainId: networkChainId }) => networkChainId === chainId
				);
				const networkType = network?.networkType;
				// !networkType this will probably happen on custom rpc networks
				if (!networkType) return;
				allTokens[checksummedAddress][networkType] =
					chainId !== `0x1`
						? preferences.accountTokens[address][chainId]
						: preferences.accountTokens[address][chainId]
								.filter(({ address }) =>
									contractMap[toChecksumAddress(address)]
										? contractMap[toChecksumAddress(address)].erc20
										: true
								)
								.map(token => ({ ...token, address: toChecksumAddress(token.address) }));
			});
		});
		await TokensController.update({ allTokens });

		// Restore preferences
		const updatedPref = { ...preferences, identities: {} };
		Object.keys(preferences.identities).forEach(address => {
			const checksummedAddress = toChecksumAddress(address);
			if (accounts.hd.includes(checksummedAddress) || accounts.simpleKeyPair.includes(checksummedAddress)) {
				updatedPref.identities[checksummedAddress] = preferences.identities[address];
				updatedPref.identities[checksummedAddress].importTime = Date.now();
			}
		});
		await PreferencesController.update(updatedPref);

		if (accounts.hd.includes(toChecksumAddress(updatedPref.selectedAddress))) {
			PreferencesController.setSelectedAddress(updatedPref.selectedAddress);
		} else {
			PreferencesController.setSelectedAddress(accounts.hd[0]);
		}

		const mapTx = tx => ({
			id: tx.id,
			networkID: tx.metamaskNetworkId,
			origin: tx.origin,
			status: tx.status,
			time: tx.time,
			transactionHash: tx.hash,
			rawTx: tx.rawTx,
			transaction: {
				from: tx.txParams.from,
				to: tx.txParams.to,
				nonce: tx.txParams.nonce,
				gas: tx.txParams.gas,
				gasPrice: tx.txParams.gasPrice,
				value: tx.txParams.value,
				maxFeePerGas: tx.txParams.maxFeePerGas,
				maxPriorityFeePerGas: tx.txParams.maxPriorityFeePerGas
			}
		});

		await TransactionController.update({
			transactions: transactions.map(mapTx)
		});

		return true;
	};
}

let instance;

export default {
	get context() {
		return instance && instance.context;
	},
	get controllerMessenger() {
		return instance && instance.controllerMessenger;
	},
	get state() {
		const {
			AccountTrackerController,
			AddressBookController,
			AssetsContractController,
			CollectiblesController,
			AssetsDetectionController,
			CurrencyRateController,
			KeyringController,
			PersonalMessageManager,
			NetworkController,
			PreferencesController,
			PhishingController,
			TokenBalancesController,
			TokenRatesController,
			TransactionController,
			TypedMessageManager,
			SwapsController,
			GasFeeController,
			TokensController
		} = instance.datamodel.state;

		// normalize `null` currencyRate to `0`
		// TODO: handle `null` currencyRate by hiding fiat values instead
		const modifiedCurrencyRateControllerState = {
			...CurrencyRateController,
			conversionRate: CurrencyRateController.conversionRate === null ? 0 : CurrencyRateController.conversionRate
		};

		return {
			AccountTrackerController,
			AddressBookController,
			AssetsContractController,
			CollectiblesController,
			AssetsDetectionController,
			CurrencyRateController: modifiedCurrencyRateControllerState,
			KeyringController,
			PersonalMessageManager,
			NetworkController,
			PhishingController,
			PreferencesController,
			TokenBalancesController,
			TokenRatesController,
			TokensController,
			TransactionController,
			TypedMessageManager,
			SwapsController,
			GasFeeController
		};
	},
	get datamodel() {
		return instance.datamodel;
	},
	getTotalFiatAccountBalance() {
		return instance.getTotalFiatAccountBalance();
	},
	hasFunds() {
		return instance.hasFunds();
	},
	resetState() {
		return instance.resetState();
	},
	sync(data) {
		return instance.sync(data);
	},
	refreshTransactionHistory(forceCheck = false) {
		return instance.refreshTransactionHistory(forceCheck);
	},
	init(state) {
		instance = new Engine(state);
		Object.freeze(instance);
		return instance;
	}
};
