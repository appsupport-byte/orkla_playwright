import { Page, Locator, expect } from '@playwright/test';
import { ENV } from '../config/env.config';
import { PageUtil } from '../utils/page.util';

/**
 * Page Object Model for Supplier Management in Orkla Dynamics 365
 * Encapsulates all locators and interaction methods for the Supplier (Vendor) pages
 */
export class SupplierPage {
    private readonly page: Page;

    // ─── Selectors ────────────────────────────────────────────────────────────────

    private readonly SELECTORS = {
        // General Section
        GENERAL_TAB_CAPTION: ['button[id*="TabGeneral_caption"]'],
        IDENTIFICATION_HEADING: ['text=Identification'],
        SUPPLIER_ID_INPUT: ['input[name="Identification_AccountNum"]'],
        NAME_INPUT: ['input[aria-labelledby*="Name"]'],
        NAME_ALIAS_INPUT: ['input[aria-labelledby*="NameAlias"]'],
        GROUP_INPUT: ['select[aria-labelledby*="Group"]', 'input[aria-labelledby*="Group"]'],
        TAX_GROUP_INPUT: ['select[aria-labelledby*="SalesTax_TaxGroup"]', 'input[aria-labelledby*="SalesTax_TaxGroup"]'],

        // Addresses Section
        ADDRESSES_TAB: ['button[aria-label="Addresses"]', 'button:has-text("Addresses")'],
        NEW_ADDRESS_BUTTON: ["button[name='NewAddress']"],
        ADDRESS_DESCRIPTION_INPUT: ['input[aria-labelledby*="Description_label"]'],
        ADDRESS_ROLE_INPUT: ['input[aria-labelledby*="Roles_label"]'],
        COUNTRY_REGION_INPUT: ['input[aria-labelledby*="CountryRegionId_input"]'],
        ZIP_CODE_INPUT: ['#LogisticsPostalAddress_7_LogisticsPostalAddress_ZipCode_input'],
        STREET_INPUT: ['textarea[aria-labelledby*="Street_label"]'],
        CITY_INPUT: ['input[aria-labelledby*="City_label"]'],

        // Contact Information Section
        CONTACT_INFO_TAB: ['button[aria-label="Contact information"]', 'button:has-text("Contact information")'],
        NEW_CONTACT_BUTTON: ["button[name='NewContactInfo']"],
        CONTACT_DESCRIPTION_INPUT: ['input[id*="ContactInfo_Description"]'],
        CONTACT_TYPE_INPUT: ['input[id*="ContactInfo_Type"]'],
        CONTACT_LOCATOR_INPUT: ['input[id*="ContactInfo_Locator"]'],
        CONTACT_ROLE_INPUT: ['input[aria-labelledby*="Roles_label"]'],

        // Purchasing Demographics Section
        PURCHASING_DEMOGRAPHICS_TAB: ['button[aria-label="Purchasing demographics"]', 'button:has-text("Purchasing demographics")'],
        CURRENCY_INPUT: ['input[id*="Currency_Currency_input"]'],
        MAIN_CONTACT_WORKER_INPUT: ['input[aria-labelledby*="MainContactWorker"]'],
        MAIN_CONTACT_WORKER_Select: ['//span[@id="HcmWorkerLookUp_8_OK_label"]'],
        VAT_NUMBER_LOOKUP: ['select[aria-labelledby*="SalesTax_VATNum"]', 'input[aria-labelledby*="SalesTax_VATNum"]'],

        // Purchase Order Defaults Section
        PURCHASE_ORDER_DEFAULTS_TAB: ['button[aria-label="Purchase order defaults"]', 'button:has-text("Purchase order defaults")'],
        PURCHASE_POOL_INPUT: ['//*[@id="vendtablelistpage_7_PurchPoolId_input"]'],
        ////*[@id="vendtablelistpage_7_PurchPoolId_input"]
        PAYMENT_TERM_INPUT: ['input[id*="Payment_PaymTermId_input"]'],
        DELIVERY_TERM_INPUT: ['input[id*="Delivery_DlvTerm_input"]'],

        // Tax Exempt Number Section
        TAX_EXEMPT_NUMBER_DROPDOWN_BUTTON: ['//*[@id="vendtablelistpage_1_SalesTax_VATNum"]/div/div'],


        // VAT Number Table
        VAT_TABLE_NEW_BUTTON: ['button[id*="TaxVATNumTable_"][id*="SystemDefinedNewButton"]'],
        VAT_TABLE_COUNTRY_INPUT: ['input[id*="TaxVATNumTable_CountryRegionId"]'],
        VAT_TABLE_NUMBER_INPUT: ['input[id*="TaxVATNumTable_VATNum"]'],
        VAT_TABLE_CLOSE_BUTTON: ['button[id*="TaxVATNumTable_"][id*="SystemDefinedCloseButton"]'],
        VAT_FORM_NUMBER_INPUT: ['select[aria-labelledby*="SalesTax_VATNum"]', 'input[aria-labelledby*="SalesTax_VATNum"]'],
    } as const;

    constructor(page: Page) {
        this.page = page;
    }

    // ─── Locators ────────────────────────────────────────────────────────────────

    // General Section
    get generalTabCaption(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.GENERAL_TAB_CAPTION]);
    }

    get identificationHeading(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.IDENTIFICATION_HEADING]);
    }

    get supplierIdInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.SUPPLIER_ID_INPUT]);
    }

    get nameInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.NAME_INPUT]);
    }

    get nameAliasInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.NAME_ALIAS_INPUT]);
    }

    get groupInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.GROUP_INPUT]);
    }

    get taxGroupInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.TAX_GROUP_INPUT]);
    }

    // Addresses Section
    get addressesTab(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.ADDRESSES_TAB]);
    }

    get newAddressButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.NEW_ADDRESS_BUTTON]);
    }

    get addressDescriptionInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.ADDRESS_DESCRIPTION_INPUT]);
    }

    get addressRoleInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.ADDRESS_ROLE_INPUT]);
    }

    get countryRegionInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.COUNTRY_REGION_INPUT]);
    }

    get zipCodeInput(): Locator {

        const zipCodepanel = this.page.locator('[id*="AddressTab_panel"]');
        const zipCodeInput = zipCodepanel.locator('[id*="ZipCode_input"]');
        return zipCodeInput;
        //return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.ZIP_CODE_INPUT]);
    }

    get streetInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.STREET_INPUT]);
    }

    get cityInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CITY_INPUT]);
    }

    // Contact Information Section
    get contactInfoTab(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CONTACT_INFO_TAB]);
    }

    get newContactButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.NEW_CONTACT_BUTTON]);
    }

    get contactDescriptionInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CONTACT_DESCRIPTION_INPUT]);
    }

    get contactTypeInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CONTACT_TYPE_INPUT]);
    }

    get contactLocatorInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CONTACT_LOCATOR_INPUT]);
    }

    get contactRoleInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CONTACT_ROLE_INPUT]);
    }

    // Purchasing Demographics Section
    get purchasingDemographicsTab(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.PURCHASING_DEMOGRAPHICS_TAB]);
    }

    get currencyInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CURRENCY_INPUT]);
    }

    get mainContactWorkerInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.MAIN_CONTACT_WORKER_INPUT]);
    }
    get mainContactWorkerSelect(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.MAIN_CONTACT_WORKER_Select]);
    }
    get vatNumberLookup(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.VAT_NUMBER_LOOKUP]);
    }

    // Purchase Order Defaults Section
    get purchaseOrderDefaultsTab(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.PURCHASE_ORDER_DEFAULTS_TAB]);
    }

    get purchasePoolInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['//input[@id="vendtablelistpage_1_PurchPoolId_input"]']);
    }

    get paymentTermInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.PAYMENT_TERM_INPUT]);
    }

    get deliveryTermInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.DELIVERY_TERM_INPUT]);
    }

    // VAT Number Table
    get vatTableNewButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.VAT_TABLE_NEW_BUTTON]);
    }

    get vatTableCountryInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.VAT_TABLE_COUNTRY_INPUT]);
    }

    get vatTableNumberInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.VAT_TABLE_NUMBER_INPUT]);
    }

    get vatTableCloseButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.VAT_TABLE_CLOSE_BUTTON]);
    }

    get vatFormNumberInput(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.VAT_FORM_NUMBER_INPUT]);
    }

    get saveButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['button[name="Save"]', 'button:has-text("Save")']);
    }
    get waitForD365Loading(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['#ShellBlockingDiv']);
    }
    get newButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['#vendtablelistpage_1_SystemDefinedNewButton']);
    }

    get okButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['//*[@id="LogisticsPostalAddress_7_OKButton_label"]']);
        // ']);
    }
    get editContactInfoButton(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['button[name="EditContactInfo"]', 'button:has-text("Edit Contact Info")']);
    }

    get addressCountryRegionIDDropdown(): Locator {
        return PageUtil.getFirstMatchingLocator(this.page, ['input[value="DEU"]']);
    }


    // ─── Navigation ───────────────────────────────────────────────────────────

    /**
     * Navigate to the Vendor list page and wait for it to fully load
     */
    async navigateToSupplierList(): Promise<void> {
        await PageUtil.navigateTo(this.page, ENV.SUPPLIER_LIST_URL);
    }

    /**
     * Assert the page has loaded by verifying key elements are visible
     */
    async assertPageLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    // ─── Toolbar Actions ──────────────────────────────────────────────────────

    /**
     * Click the New button to begin creating a new supplier record
     */
    async clickNew(): Promise<void> {
        await PageUtil.clickElementButtonName(this.newButton, 'New');
        // Wait for D365 to dismiss any loading overlay before checking for form
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
    }

    /**
     * Click the Save button to persist changes
     */
    async clickSave(): Promise<void> {
        await PageUtil.clickElementButtonName(this.saveButton, 'Save');
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
    }

    // ─── General Section ──────────────────────────────────────────────────────

    /**
     * Wait for the General section to become visible after clicking New
     */
    async waitForGeneralSection(): Promise<void> {
        await PageUtil.waitForElement(this.generalTabCaption, {
            state: 'visible',
            timeout: ENV.PAGE_LOAD_TIMEOUT,
        });
    }
    async waitForIdentificationHeading(): Promise<void> {
        await PageUtil.waitForElement(this.identificationHeading, {
            state: 'visible',
            timeout: ENV.PAGE_LOAD_TIMEOUT,
        });
    }

    /**
     * Read the auto-generated supplier ID from the Identification field
     */
    async getGeneratedSupplierId(): Promise<string> {
        return this.supplierIdInput.inputValue();
    }

    async fillName(name: string): Promise<void> {
        await PageUtil.fillInput(this.nameInput, name, 'Name');
    }

    async fillNameAlias(alias: string): Promise<void> {
        await PageUtil.fillInput(this.nameAliasInput, alias, 'Name Alias');
    }

    async selectVendorGroup(group: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.groupInput, group, 'Escape', 'Vendor Group');
    }

    async selectTaxGroup(taxGroup: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.taxGroupInput, taxGroup, 'Escape', 'Tax Group');
    }

    // Addresses Section
    async expandAddressesTab(): Promise<void> {
        await PageUtil.expandTabIfCollapsed(this.addressesTab, 'Addresses tab');
    }

    async clickNewAddress(): Promise<void> {
        await PageUtil.clickElement(this.newAddressButton, 'New Address button');
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
    }

    async fillAddressDescription(description: string): Promise<void> {

        await PageUtil.fillInput(this.addressDescriptionInput, description, 'Address Description');

    }

    async selectAddressRole(role: string): Promise<void> {

        await PageUtil.fillInput(this.addressRoleInput, role, 'Address Role');
    }

    async selectCountryRegion(country: string): Promise<void> {

        //await PageUtil.clickElement(this.addressCountryRegionIDDropdown, 'Country Region input');
        //await PageUtil.fillInputAfterDeletingPriorValue(this.countryRegionInput, country, 'Country Region');
        const ValueLocator = PageUtil.getFirstMatchingLocator(this.page, [`//input[@value="${country}"]`]);
        await PageUtil.lookupSelectWithIcon(this.countryRegionInput, ValueLocator, country, 0);



    }

    async fillZipCode(zipCode: string): Promise<void> {
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
        await this.zipCodeInput.waitFor({ state: 'visible' });
        await PageUtil.fillOnlyInput(this.zipCodeInput, zipCode, 'Zip Code');
        // await PageUtil.fillOnlyInput(this.zipCodeInput, zipCode, 'Zip Code');

    }

    async fillStreet(street: string): Promise<void> {
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
        await PageUtil.fillOnlyInput(this.streetInput, street, 'Street');
    }

    async fillCity(city: string): Promise<void> {
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
        await PageUtil.fillOnlyInput(this.cityInput, city, 'City');
    }

    async confirmDialog(): Promise<void> {
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
        // Use keyboard on the focused element rather than a specific locator
        await this.page.keyboard.press('Enter');
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
    }

    // Contact Information Section
    async expandContactInformationTab(): Promise<void> {
        await PageUtil.expandTabIfCollapsed(this.contactInfoTab, 'Contact Information tab');
    }

    async clickNewContactInfo(): Promise<void> {
        await PageUtil.clickElement(this.newContactButton, 'New Contact button');
    }

    async fillContactDescription(description: string): Promise<void> {
        await PageUtil.fillInput(this.contactDescriptionInput, description, 'Contact Description');
    }

    async selectContactType(type: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.contactTypeInput, type, 'Enter', 'Contact Type');
        await PageUtil.waitForD365Loading(this.waitForD365Loading);
    }

    async fillContactLocator(locator: string): Promise<void> {
        await PageUtil.fillInput(this.contactLocatorInput, locator, 'Contact Locator');
        await this.contactLocatorInput.page().waitForTimeout(500); // Brief pause to allow any dynamic changes to take effect
    }

    async clickEditContactInfo(): Promise<void> {
        await PageUtil.clickElement(this.editContactInfoButton, 'Edit Contact Info button');
    }

    async selectContactRole(role: string, select: string): Promise<void> {
        if (select === "all") {
            const subLocator = this.page.getByRole('checkbox', { name: 'Select or unselect all rows' });
            await PageUtil.lookupSelectWithIconWithSelect(this.contactRoleInput, subLocator, role, select);
        } else {
            const subLocator = this.page.locator(`input[value="${role}"]:visible`).first();
            await PageUtil.lookupSelectWithIconWithSelect(this.contactRoleInput, subLocator, role, select);
        }
    }

    // Purchasing Demographics Section
    async expandPurchasingDemographicsTab(): Promise<void> {
        await PageUtil.expandTabIfCollapsed(this.purchasingDemographicsTab, 'Purchasing Demographics tab');
    }

    async selectCurrency(currency: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.currencyInput, currency, 'Enter', 'Currency');
    }

    async selectMainContactWorker(worker: string): Promise<void> {
        await PageUtil.fillInput(this.mainContactWorkerInput, worker, 'Main Contact Worker');
        await PageUtil.PressKey(this.mainContactWorkerInput, 'Alt+Enter');
        // await PageUtil.assertElementVisible(this.mainContactWorkerSelect, ENV.PAGE_LOAD_TIMEOUT);
        // await PageUtil.clickElement(this.mainContactWorkerSelect, 'Main Contact Worker select option');

    }

    async openVatNumberDetails(): Promise<void> {
        // Ensure we target the input (not select) for right-click context menu
        const vatInput = this.page.locator('input[aria-labelledby*="SalesTax_VATNum"]').first();
        await PageUtil.rightClickAndSelectOption(vatInput, 'View details', 'VAT Number Lookup');
    }

    // Purchase Order Defaults Section
    async expandPurchaseOrderDefaultsTab(): Promise<void> {
        await PageUtil.expandTabIfCollapsed(this.purchaseOrderDefaultsTab, 'Purchase Order Defaults tab');
    }

    async selectPurchasePool(pool: string): Promise<void> {
        await PageUtil.fillInput(this.purchasePoolInput, pool, 'Purchase Pool');
    }

    async selectPaymentTerm(term: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.paymentTermInput, term, 'Enter', 'Payment Term');
    }

    async selectDeliveryTerm(term: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.deliveryTermInput, term, 'Enter', 'Delivery Term');
    }

    // VAT Number Table
    async clickVatTableNew(): Promise<void> {
        await PageUtil.clickElement(this.vatTableNewButton, 'VAT Table New button');
    }

    async selectVatTableCountry(country: string): Promise<void> {
        await PageUtil.fillAndPressKey(this.vatTableCountryInput, country, 'Enter', 'VAT Country');
    }

    async fillVatTableNumber(vatNumber: string): Promise<void> {
        await PageUtil.fillInput(this.vatTableNumberInput, vatNumber, 'VAT Number');
    }

    async closeVatTable(): Promise<void> {
        await PageUtil.clickElement(this.vatTableCloseButton, 'VAT Table Close button');
    }

    async fillVatFormNumber(vatNumber: string): Promise<void> {
        await PageUtil.fillInput(this.vatFormNumberInput, vatNumber, 'VAT Form Number');
    }

    // ─── Assertions ───────────────────────────────────────────────────────────────

    async assertSupplierSaved(): Promise<void> {
        await PageUtil.assertElementVisible(this.generalTabCaption, ENV.PAGE_LOAD_TIMEOUT);
    }
}