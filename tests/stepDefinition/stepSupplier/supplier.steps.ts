import { Given, When, Then } from '@cucumber/cucumber';
import { OrklaWorld } from '../../support/world';
import { ENV } from '../../config/env.config';
import { SupplierPage } from '../../pages/supplierPage';
import { RuntimeDataStore } from '../../utils/runtime-data.util';
import { Logger } from '../../utils/logger.util';
import { DataTable } from '@cucumber/cucumber';

// ─── Helper: build a SupplierPage from the World's live page ─────────────────
const sp = (world: OrklaWorld): SupplierPage => new SupplierPage(world.page);


Given<OrklaWorld>('I navigate to the Orkla UAT2 supplier management page', async function () {
  await sp(this).navigateToSupplierList();
});

Given<OrklaWorld>('the page loads completely', async function () {
  await sp(this).assertPageLoaded();
});


When<OrklaWorld>('I click the New button to create a new supplier', async function () {
  await sp(this).clickNew();
  await sp(this).waitForGeneralSection();
  await sp(this).waitForIdentificationHeading();
});

Then<OrklaWorld>('I fill in the General section with:', async function (dataTable: DataTable) {
  const data = dataTable.rowsHash();
  const vendorName = data['Name'] + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  Logger.info(`Filling General section for vendor: ${vendorName}`);

  await sp(this).fillName(vendorName);
  await sp(this).fillNameAlias(data['NameAlias']);
  await sp(this).selectVendorGroup(data['Group']);
  await sp(this).selectTaxGroup(data['SalesTax_TaxGroup']);

});

Then<OrklaWorld>('I expand the Addresses tab', async function () {
  await sp(this).expandAddressesTab();
});

Then<OrklaWorld>('I fill in the Addresses section with:', async function (dataTable: DataTable) {
  const data = dataTable.rowsHash();
  Logger.info(`Adding address for country: ${data['CountryRegionId_input']}`);

  await sp(this).clickNewAddress();
  await sp(this).fillAddressDescription(data['Description_label']);
  //await sp(this).selectAddressRole(data['Roles_label']);
  //await sp(this).selectCountryRegion(data['CountryRegionId_input']);
  await sp(this).fillZipCode(data['ZipCode_label']);
  await sp(this).fillStreet(data['Street_label']);
  await sp(this).fillCity(data['City_label']);
  await sp(this).confirmDialog();
})

Then<OrklaWorld>('I expand the Contact information tab', async function () {
  await sp(this).expandContactInformationTab();
});

Then<OrklaWorld>('I fill in the Contact Information section with:', async function (dataTable: DataTable) {
  const data = dataTable.rowsHash();
  Logger.info(`Adding contact: ${data['ContactInfo_Description']}`);

  await sp(this).clickNewContactInfo();
  await sp(this).fillContactDescription(data['ContactInfo_Description']);
  await sp(this).selectContactType(data['ContactInfo_Type']);
  await sp(this).fillContactLocator(data['ContactInfo_Locator']);

});

Then<OrklaWorld>('I set the contact role to Business for all contact types', async function () {
   await sp(this).clickEditContactInfo();

   /*await sp(this).selectContactRole('Business', 'all');
   await sp(this).confirmDialog();
   Logger.info('Contact role set to Business for all types');*/
});

Then<OrklaWorld>('I expand the Purchasing demographics tab', async function () {
  //await sp(this).expandPurchasingDemographicsTab();
});

Then<OrklaWorld>('I fill in the Purchasing Demographics section with:', async function (dataTable: DataTable) {
  const data = dataTable.rowsHash();
  Logger.info(`Setting purchasing demographics — worker: ${data['MainContactWorker']}`);

  if (data['Currency_Currency_input']) {
    await sp(this).selectCurrency(data['Currency_Currency_input']);
  }
  await sp(this).selectMainContactWorker(data['MainContactWorker']);
  await sp(this).openVatNumberDetails();
});

Then<OrklaWorld>('I expand the Purchase order defaults tab', async function () {
  await sp(this).expandPurchaseOrderDefaultsTab();
});

Then<OrklaWorld>('I fill in the Purchase Order Defaults section with:', async function (dataTable: DataTable) {

  const data = dataTable.rowsHash();
  Logger.info(`Setting purchase order defaults — payment: ${data['Payment_PaymTermId_input']}, delivery: ${data['Delivery_DlvTerm_input']}`);

  if (data['PurchPoolId_label']) {
    await sp(this).selectPurchasePool(data['PurchPoolId_label']);
  }
  await sp(this).selectPaymentTerm(data['Payment_PaymTermId_input']);
  await sp(this).selectDeliveryTerm(data['Delivery_DlvTerm_input']);
});

Then<OrklaWorld>('I add VAT Number with:', async function (dataTable: DataTable) {
  const data = dataTable.rowsHash();
  Logger.info(`Adding VAT number for country: ${data['TaxVATNumTable_CountryRegionId']}`);

  await sp(this).clickVatTableNew();
  await sp(this).selectVatTableCountry(data['TaxVATNumTable_CountryRegionId']);
  await sp(this).fillVatTableNumber(data['TaxVATNumTable_VATNum']);
  await sp(this).closeVatTable();
  await sp(this).fillVatFormNumber(data['TaxVATNumTable_VATNum']);
});

When<OrklaWorld>('I save the supplier record', async function () {
  await sp(this).clickSave();
  Logger.info('Supplier record save triggered');
});


Then<OrklaWorld>('a new supplier ID is generated automatically', async function () {

  const generatedSupplierId = await sp(this).getGeneratedSupplierId();
  RuntimeDataStore.save('generatedSupplierId', generatedSupplierId);
  Logger.info(`Auto-generated Supplier ID: ${generatedSupplierId}`);
  Logger.success(`Supplier ID "${RuntimeDataStore.get('generatedSupplierId')}" stored as "generatedSupplierId"`);
});





















Then<OrklaWorld>('the supplier is created successfully', async function () {
  await sp(this).assertSupplierSaved();
  Logger.success(`Supplier created successfully — ID: ${RuntimeDataStore.get('generatedSupplierId')}`);
});


