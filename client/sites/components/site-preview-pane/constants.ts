export const DOTCOM_OVERVIEW = 'dotcom-hosting';
export const DOTCOM_MONITORING = 'dotcom-site-monitoring';
export const DOTCOM_LOGS_PHP = 'dotcom-site-logs-php';
export const DOTCOM_LOGS_WEB = 'dotcom-site-logs-web';
export const DOTCOM_GITHUB_DEPLOYMENTS = 'dotcom-github-deployments';
export const DOTCOM_HOSTING_CONFIG = 'dotcom-hosting-config';
export const DOTCOM_HOSTING_FEATURES = 'dotcom-hosting-features';
export const DOTCOM_STAGING_SITE = 'dotcom-staging-site';
export const DOTCOM_SITE_PERFORMANCE = 'dotcom-site-performance';

export const OVERVIEW = 'overview';

export const MARKETING_TOOLS = 'marketing-tools';
export const MARKETING_CONNECTIONS = 'marketing-connections';
export const MARKETING_TRAFFIC = 'marketing-traffic';
export const MARKETING_SHARING = 'marketing-sharing';

export const TOOLS_STAGING_SITE = 'tools-staging-site';
export const TOOLS_DEPLOYMENTS = 'tools-deployments';
export const TOOLS_MONITORING = 'tools-monitoring';
export const TOOLS_LOGS_PHP = 'tools-logs-php';
export const TOOLS_LOGS_WEB = 'tools-logs-web';
export const TOOLS_SFTP_SSH = 'tools-sftp-ssh';
export const TOOLS_DATABASE = 'tools-database';
export const TOOLS = 'tools';

export const SETTINGS_SITE = 'settings-site';
export const SETTINGS_ADMINISTRATION = 'settings-administration';
export const SETTINGS_ADMINISTRATION_RESET_SITE = 'settings-administration-reset-site';
export const SETTINGS_ADMINISTRATION_TRANSFER_SITE = 'settings-administration-transfer-site';
export const SETTINGS_ADMINISTRATION_DELETE_SITE = 'settings-administration-delete-site';
export const SETTINGS_AGENCY = 'settings-agency';
export const SETTINGS_CACHING = 'settings-caching';
export const SETTINGS_WEB_SERVER = 'settings-web-server';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ DOTCOM_OVERVIEW ]: 'overview/:site',
	[ DOTCOM_MONITORING ]: 'site-monitoring/:site',
	[ DOTCOM_LOGS_PHP ]: 'site-logs/:site/php',
	[ DOTCOM_LOGS_WEB ]: 'site-logs/:site/web',
	[ DOTCOM_GITHUB_DEPLOYMENTS ]: 'github-deployments/:site',
	[ DOTCOM_HOSTING_CONFIG ]: 'hosting-config/:site',
	[ DOTCOM_HOSTING_FEATURES ]: 'hosting-features/:site',
	[ DOTCOM_STAGING_SITE ]: 'staging-site/:site',
	[ DOTCOM_SITE_PERFORMANCE ]: 'sites/performance/:site',

	// New Information Architecture
	[ OVERVIEW ]: 'sites/overview/:site',
	[ MARKETING_TOOLS ]: 'sites/marketing/tools/:site',
	[ MARKETING_CONNECTIONS ]: 'sites/marketing/connections/:site',
	[ MARKETING_TRAFFIC ]: 'sites/marketing/traffic/:site',
	[ MARKETING_SHARING ]: 'sites/marketing/sharing-buttons/:site',
	[ TOOLS_STAGING_SITE ]: 'sites/tools/staging-site/:site',
	[ TOOLS_DEPLOYMENTS ]: 'sites/tools/deployments/:site',
	[ TOOLS_MONITORING ]: 'sites/tools/monitoring/:site',
	[ TOOLS_LOGS_PHP ]: 'sites/tools/logs/:site/php',
	[ TOOLS_LOGS_WEB ]: 'sites/tools/logs/:site/web',
	[ TOOLS_SFTP_SSH ]: 'sites/tools/sftp-ssh/:site',
	[ TOOLS_DATABASE ]: 'sites/tools/database/:site',
	[ TOOLS ]: 'sites/tools/:site',
	[ SETTINGS_SITE ]: 'sites/settings/site/:site',
	[ SETTINGS_ADMINISTRATION ]: 'sites/settings/administration/:site',
	[ SETTINGS_ADMINISTRATION_RESET_SITE ]: 'sites/settings/administration/:site/reset-site',
	[ SETTINGS_ADMINISTRATION_TRANSFER_SITE ]: 'sites/settings/administration/:site/transfer-site',
	[ SETTINGS_ADMINISTRATION_DELETE_SITE ]: 'sites/settings/administration/:site/delete-site',
	[ SETTINGS_AGENCY ]: 'sites/settings/agency/:site',
	[ SETTINGS_CACHING ]: 'sites/settings/caching/:site',
	[ SETTINGS_WEB_SERVER ]: 'sites/settings/web-server/:site',
};
