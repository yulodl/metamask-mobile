import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Browser from '../../Views/Browser';
import AddBookmark from '../../Views/AddBookmark';
import SimpleWebview from '../../Views/SimpleWebview';
import Approval from '../../Views/Approval';
import Settings from '../../Views/Settings';
import GeneralSettings from '../../Views/Settings/GeneralSettings';
import AdvancedSettings from '../../Views/Settings/AdvancedSettings';
import SecuritySettings from '../../Views/Settings/SecuritySettings';
import ExperimentalSettings from '../../Views/Settings/ExperimentalSettings';
import NetworksSettings from '../../Views/Settings/NetworksSettings';
import NetworkSettings from '../../Views/Settings/NetworksSettings/NetworkSettings';
import AppInformation from '../../Views/Settings/AppInformation';
import Contacts from '../../Views/Settings/Contacts';
import Wallet from '../../Views/Wallet';
import Asset from '../../Views/Asset';
import AddAsset from '../../Views/AddAsset';
import Collectible from '../../Views/Collectible';
import CollectibleView from '../../Views/CollectibleView';
import Send from '../../Views/Send';
import SendTo from '../../Views/SendFlow/SendTo';
import RevealPrivateCredential from '../../Views/RevealPrivateCredential';
import WalletConnectSessions from '../../Views/WalletConnectSessions';
import OfflineMode from '../../Views/OfflineMode';
import QrScanner from '../../Views/QRScanner';
import LockScreen from '../../Views/LockScreen';
import ChoosePasswordSimple from '../../Views/ChoosePasswordSimple';
import EnterPasswordSimple from '../../Views/EnterPasswordSimple';
import ChoosePassword from '../../Views/ChoosePassword';
import ResetPassword from '../../Views/ResetPassword';
import AccountBackupStep1 from '../../Views/AccountBackupStep1';
import AccountBackupStep1B from '../../Views/AccountBackupStep1B';
import ManualBackupStep1 from '../../Views/ManualBackupStep1';
import ManualBackupStep2 from '../../Views/ManualBackupStep2';
import ManualBackupStep3 from '../../Views/ManualBackupStep3';
import ImportPrivateKey from '../../Views/ImportPrivateKey';
import ImportPrivateKeySuccess from '../../Views/ImportPrivateKeySuccess';
import PaymentRequest from '../../UI/PaymentRequest';
import PaymentRequestSuccess from '../../UI/PaymentRequestSuccess';
import Approve from '../../Views/ApproveView/Approve';
import Amount from '../../Views/SendFlow/Amount';
import Confirm from '../../Views/SendFlow/Confirm';
import ContactForm from '../../Views/Settings/Contacts/ContactForm';
import PaymentMethodSelector from '../../UI/FiatOrders/PaymentMethodSelector';
import PaymentMethodApplePay from '../../UI/FiatOrders/PaymentMethodApplePay';
import TransakWebView from '../../UI/FiatOrders/TransakWebView';
import ActivityView from '../../Views/ActivityView';
import SwapsAmountView from '../../UI/Swaps';
import SwapsQuotesView from '../../UI/Swaps/QuotesView';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
	headerLogo: {
		width: 125,
		height: 50
	}
});
/**
 * Navigator component that wraps
 * the 2 main sections: Browser, Wallet
 */

const MainNavigator = () => (
	<Stack.Navigator mode={'modal'} headerMode={'none'}>
		<Stack.Screen
			name="Home"
			tabBarVisible={false}
			component={() => (
				<Tab.Navigator>
					<Tab.Screen
						name="WalletTabHome"
						component={() => (
							<Stack.Navigator>
								<Stack.Screen name="WalletView" component={Wallet} />
								<Stack.Screen name="Asset" component={Asset} />
								<Stack.Screen name="AddAsset" component={AddAsset} />

								<Stack.Screen name="Collectible" component={Collectible} />

								<Stack.Screen name="CollectibleView" component={CollectibleView} />

								<Stack.Screen name="RevealPrivateCredentialView" component={RevealPrivateCredential} />
							</Stack.Navigator>
						)}
					/>
					<Tab.Screen
						name="BrowserTabHome"
						component={() => (
							<Stack.Navigator>
								<Stack.Screen name="BrowserView" component={Browser} gestureEnabled={false} />
							</Stack.Navigator>
						)}
					/>
					<Tab.Screen
						name="TransactionsHome"
						component={() => (
							<Stack.Navigator>
								<Stack.Screen name="TransactionsView" component={ActivityView} />
							</Stack.Navigator>
						)}
					/>
				</Tab.Navigator>
			)}
		/>
		<Stack.Screen
			name="Webview"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="SimpleWebview" component={SimpleWebview} mode={'modal'} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="SettingsView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="Settings" component={Settings} />
					<Stack.Screen name="GeneralSettings" component={GeneralSettings} />
					<Stack.Screen name="AdvancedSettings" component={AdvancedSettings} />
					<Stack.Screen name="SecuritySettings" component={SecuritySettings} />
					<Stack.Screen name="ExperimentalSettings" component={ExperimentalSettings} />
					<Stack.Screen name="NetworksSettings" component={NetworksSettings} />
					<Stack.Screen name="NetworkSettings" component={NetworkSettings} />
					<Stack.Screen name="CompanySettings" component={AppInformation} />
					<Stack.Screen name="ContactsSettings" component={Contacts} />
					<Stack.Screen name="ContactForm" component={ContactForm} />
					<Stack.Screen name="RevealPrivateCredentialView" component={RevealPrivateCredential} />
					<Stack.Screen name="WalletConnectSessionsView" component={WalletConnectSessions} />
					<Stack.Screen name="ChoosePasswordSimple" component={ChoosePasswordSimple} />
					<Stack.Screen name="ResetPassword" component={ResetPassword} />
					<Stack.Screen name="ManualBackupStep1" component={ManualBackupStep1} />
					<Stack.Screen name="ManualBackupStep2" component={ManualBackupStep2} />
					<Stack.Screen name="ManualBackupStep3" component={ManualBackupStep3} />
					<Stack.Screen name="EnterPasswordSimple" component={EnterPasswordSimple} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="ImportPrivateKeyView"
			headerMode={'none'}
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
					<Stack.Screen name="ImportPrivateKeySuccess" component={ImportPrivateKeySuccess} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="SendView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="Send" component={Send} />
					<Stack.Screen name="ImportPrivateKeySuccess" component={ImportPrivateKeySuccess} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="SendFlowView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="SendTo" component={SendTo} />
					<Stack.Screen name="Amount" component={Amount} />
					<Stack.Screen name="Confirm" component={Confirm} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="ApprovalView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="Approval" component={Approval} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="ApproveView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="Approve" component={Approve} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="AddBookmarkView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="AddBookmark" component={AddBookmark} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="OfflineModeView"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="OfflineMode" component={OfflineMode} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen name="QRScanner" component={QrScanner} />
		<Stack.Screen name="LockScreen" component={LockScreen} />
		<Stack.Screen
			name="PaymentRequestView"
			mode={'modal'}
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="PaymentRequest" component={PaymentRequest} />
					<Stack.Screen name="PaymentRequestSuccess" component={PaymentRequestSuccess} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="FiatOnRamp"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="PaymentMethodSelector" component={PaymentMethodSelector} />
					<Stack.Screen name="PaymentMethodApplePay" component={PaymentMethodApplePay} />
					<Stack.Screen name="TransakFlow" component={TransakWebView} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="Swaps"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="SwapsAmountView" component={SwapsAmountView} />
					<Stack.Screen name="SwapsQuotesView" component={SwapsQuotesView} />
				</Stack.Navigator>
			)}
		/>
		<Stack.Screen
			name="SetPasswordFlow"
			component={() => (
				<Stack.Navigator>
					<Stack.Screen name="ChoosePassword" component={ChoosePassword} />
					<Stack.Screen name="AccountBackupStep1" component={AccountBackupStep1} />
					<Stack.Screen name="AccountBackupStep1" component={AccountBackupStep1} />
					<Stack.Screen name="AccountBackupStep1" component={AccountBackupStep1} />
					<Stack.Screen name="AccountBackupStep1B" component={AccountBackupStep1B} />
					<Stack.Screen name="ManualBackupStep1" component={ManualBackupStep1} />
					<Stack.Screen name="ManualBackupStep2" component={ManualBackupStep2} />
					<Stack.Screen name="ManualBackupStep3" component={ManualBackupStep3} />
				</Stack.Navigator>
			)}
			headerTitle={() => (
				<Image
					style={styles.headerLogo}
					source={require('../../../images/metamask-name.png')}
					resizeMode={'contain'}
				/>
			)}
			// eslint-disable-next-line react-native/no-inline-styles
			headerStyle={{ borderBottomWidth: 0 }}
		/>
	</Stack.Navigator>
);

export default MainNavigator;

/*
export default createStackNavigator(
	{
		Home: {
			screen: createBottomTabNavigator(
				{
					WalletTabHome: createStackNavigator({
						WalletView: {
							screen: Wallet
						},
						Asset: {
							screen: Asset
						},
						AddAsset: {
							screen: AddAsset
						},
						Collectible: {
							screen: Collectible
						},
						CollectibleView: {
							screen: CollectibleView
						},
						RevealPrivateCredentialView: {
							screen: RevealPrivateCredential
						}
					}),
					BrowserTabHome: createStackNavigator({
						BrowserView: {
							screen: Browser,
							navigationOptions: {
								gesturesEnabled: false
							}
						}
					}),
					TransactionsHome: createStackNavigator({
						TransactionsView: {
							screen: ActivityView
						}
					})
				},
				{
					defaultNavigationOptions: () => ({
						tabBarVisible: false
					})
				}
			)
		},
		Webview: {
			screen: createStackNavigator(
				{
					SimpleWebview: {
						screen: SimpleWebview
					}
				},
				{
					mode: 'modal'
				}
			)
		},
		SettingsView: {
			screen: createStackNavigator({
				Settings: {
					screen: Settings
				},
				GeneralSettings: {
					screen: GeneralSettings
				},
				AdvancedSettings: {
					screen: AdvancedSettings
				},
				SecuritySettings: {
					screen: SecuritySettings
				},
				ExperimentalSettings: {
					screen: ExperimentalSettings
				},
				NetworksSettings: {
					screen: NetworksSettings
				},
				NetworkSettings: {
					screen: NetworkSettings
				},
				CompanySettings: {
					screen: AppInformation
				},
				ContactsSettings: {
					screen: Contacts
				},
				ContactForm: {
					screen: ContactForm
				},
				RevealPrivateCredentialView: {
					screen: RevealPrivateCredential
				},
				WalletConnectSessionsView: {
					screen: WalletConnectSessions
				},
				ChoosePasswordSimple: {
					screen: ChoosePasswordSimple
				},
				ResetPassword: {
					screen: ResetPassword
				},
				ManualBackupStep1: {
					screen: ManualBackupStep1
				},
				ManualBackupStep2: {
					screen: ManualBackupStep2
				},
				ManualBackupStep3: {
					screen: ManualBackupStep3
				},
				EnterPasswordSimple: {
					screen: EnterPasswordSimple
				}
			})
		},
		ImportPrivateKeyView: {
			screen: createStackNavigator(
				{
					ImportPrivateKey: {
						screen: ImportPrivateKey
					},
					ImportPrivateKeySuccess: {
						screen: ImportPrivateKeySuccess
					}
				},
				{
					headerMode: 'none'
				}
			)
		},
		SendView: {
			screen: createStackNavigator({
				Send: {
					screen: Send
				}
			})
		},
		SendFlowView: {
			screen: createStackNavigator({
				SendTo: {
					screen: SendTo
				},
				Amount: {
					screen: Amount
				},
				Confirm: {
					screen: Confirm
				}
			})
		},
		ApprovalView: {
			screen: createStackNavigator({
				Approval: {
					screen: Approval
				}
			})
		},
		ApproveView: {
			screen: createStackNavigator({
				Approve: {
					screen: Approve
				}
			})
		},
		AddBookmarkView: {
			screen: createStackNavigator({
				AddBookmark: {
					screen: AddBookmark
				}
			})
		},
		OfflineModeView: {
			screen: createStackNavigator({
				OfflineMode: {
					screen: OfflineMode
				}
			})
		},
		// ALL FULL SCREEN MODALS SHOULD GO HERE
		QRScanner: {
			screen: QrScanner
		},
		LockScreen: {
			screen: LockScreen
		},
		PaymentRequestView: {
			screen: createStackNavigator(
				{
					PaymentRequest: {
						screen: PaymentRequest
					},
					PaymentRequestSuccess: {
						screen: PaymentRequestSuccess
					}
				},
				{
					mode: 'modal'
				}
			)
		},
		FiatOnRamp: {
			screen: createStackNavigator({
				PaymentMethodSelector: { screen: PaymentMethodSelector },
				PaymentMethodApplePay: { screen: PaymentMethodApplePay },
				TransakFlow: { screen: TransakWebView }
			})
		},
		Swaps: {
			screen: createStackNavigator({
				SwapsAmountView: { screen: SwapsAmountView },
				SwapsQuotesView: { screen: SwapsQuotesView }
			})
		},
		SetPasswordFlow: {
			screen: createStackNavigator(
				{
					ChoosePassword: {
						screen: ChoosePassword
					},
					AccountBackupStep1: {
						screen: AccountBackupStep1
					},
					AccountBackupStep1B: {
						screen: AccountBackupStep1B
					},
					ManualBackupStep1: {
						screen: ManualBackupStep1
					},
					ManualBackupStep2: {
						screen: ManualBackupStep2
					},
					ManualBackupStep3: {
						screen: ManualBackupStep3
					}
				},
				{
					defaultNavigationOptions: {
						// eslint-disable-next-line
						headerTitle: () => (
							<Image
								style={styles.headerLogo}
								source={require('../../../images/metamask-name.png')}
								resizeMode={'contain'}
							/>
						),
						headerStyle: {
							borderBottomWidth: 0
						}
					}
				}
			)
		}
	},
	{
		mode: 'modal',
		headerMode: 'none',
		lazy: true
	}
);
*/
