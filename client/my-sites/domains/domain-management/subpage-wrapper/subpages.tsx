import { __ } from '@wordpress/i18n';
import AddForwardingEmailHeader from './headers/add-fowarding-email-header';
import CompareEmailProvidersHeader from './headers/compare-email-providers';
import { CustomHeaderComponentType } from './headers/custom-header-component-type';
import DnsRecordHeader, {
	addDnsRecordTitle,
	addDnsRecordsSubtitle,
	editDnsRecordTitle,
} from './headers/dns-record-header';
import DNSRecordsHeader, {
	dnsRecordsTitle,
	dnsRecordsSubtitle,
} from './headers/dns-records-header';

type SubpageWrapperParamsType = {
	CustomHeader?: CustomHeaderComponentType;
	title?: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	context?: string;
	[ key: string ]: unknown;
};

// Subpage keys
export const ADD_FORWARDING_EMAIL = 'add-forwarding-email';
export const COMPARE_EMAIL_PROVIDERS = 'compare-email-providers';
export const DNS_RECORDS = 'dns-records';
export const ADD_DNS_RECORD = 'add-dns-record';
export const EDIT_DNS_RECORD = 'edit-dns-record';
export const EDIT_CONTACT_INFO = 'edit-contact-info';

// Subpage params map
const SUBPAGE_TO_PARAMS_MAP: Record< string, SubpageWrapperParamsType > = {
	[ ADD_FORWARDING_EMAIL ]: {
		CustomHeader: AddForwardingEmailHeader,
		showFormHeader: true,
		showPageHeader: false,
	},
	[ COMPARE_EMAIL_PROVIDERS ]: {
		CustomHeader: CompareEmailProvidersHeader,
	},
	[ DNS_RECORDS ]: {
		CustomHeader: DNSRecordsHeader,
		titleOverride: dnsRecordsTitle,
		subtitleOverride: dnsRecordsSubtitle,
		showBreadcrumb: false,
		showDetails: false,
	},
	[ EDIT_CONTACT_INFO ]: {
		title: __( 'Contact information' ),
		subtitle: __( "Manage your domain's contact details." ),
	},
	[ ADD_DNS_RECORD ]: {
		CustomHeader: DnsRecordHeader,
		titleOverride: addDnsRecordTitle,
		subtitleOverride: addDnsRecordsSubtitle,
		showBreadcrumb: false,
		context: 'add',
	},
	[ EDIT_DNS_RECORD ]: {
		CustomHeader: DnsRecordHeader,
		titleOverride: editDnsRecordTitle,
		subtitleOverride: addDnsRecordsSubtitle,
		showBreadcrumb: false,
		context: 'edit',
	},
};

export const getSubpageParams = ( subPageKey: string ): SubpageWrapperParamsType => {
	return SUBPAGE_TO_PARAMS_MAP[ subPageKey ];
};
