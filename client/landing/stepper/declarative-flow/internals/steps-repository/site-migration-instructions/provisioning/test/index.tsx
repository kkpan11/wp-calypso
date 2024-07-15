/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provisioning } from '..';

describe( 'Provisioning', () => {
	it( 'should render the first non-successful action', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'pending',
			migrationKey: 'error',
		};

		render( <Provisioning status={ status } /> );

		expect( screen.getByText( 'Installing the required plugins' ) ).toBeVisible();
	} );

	it( 'should render the correct action progress number', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'pending',
			migrationKey: 'error',
		};

		render( <Provisioning status={ status } /> );

		expect( screen.getByText( '2/3' ) ).toBeVisible();
	} );

	it( 'should render error message when an action failed', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'success',
			migrationKey: 'error',
		};

		const { container } = render( <Provisioning status={ status } /> );
		const message = container.querySelector( '.migration-instructions-provisioning__message' );

		expect( message?.textContent ).toBe(
			'Sorry, we couldn’t finish setting up your site. Please, contact support.'
		);
	} );

	it( "shouldn't render when all actions are done", () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'success',
			migrationKey: 'success',
		};

		const { container } = render( <Provisioning status={ status } /> );
		const provisioningElement = container.getElementsByClassName(
			'migration-instructions-provisioning'
		);

		expect( provisioningElement.length ).toBe( 0 );
	} );
} );
