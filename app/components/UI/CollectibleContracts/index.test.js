import React from 'react';
import { shallow } from 'enzyme';
import CollectibleContracts from './';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe('CollectibleContracts', () => {
	it('should render correctly', () => {
		const initialState = {
			collectibles: {
				favorites: {}
			},
			engine: {
				backgroundState: {
					NetworkController: {
						provider: {
							chainId: 1
						}
					},
					PreferencesController: {
						selectedAddress: '0x1'
					},
					CollectiblesController: {
						collectibleContracts: [
							{
								name: 'name',
								logo: 'logo',
								address: '0x0',
								symbol: 'NM',
								description: 'description',
								totalSupply: 10
							}
						],
						collectibles: {}
					}
				}
			}
		};

		const wrapper = shallow(
			<CollectibleContracts
				route={{ params: { address: '0x1' } }}
				collectibles={[
					{
						address: '0x0',
						tokenId: 10,
						name: 'name',
						image: 'image'
					}
				]}
			/>,
			{
				context: { store: mockStore(initialState) }
			}
		);
		expect(wrapper.dive()).toMatchSnapshot();
	});
});
