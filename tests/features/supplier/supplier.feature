@supplier
Feature: Create Suppliers in Orkla Operations
  As a procurement user
  I want to create new suppliers in the system
  So that I can manage vendor relationships and purchase orders

  Background:
    Given I navigate to the Orkla UAT2 supplier management page
    And the page loads completely

  Scenario Outline: Create suppliers with different regions and configurations
    When I click the New button to create a new supplier
    And I fill in the General section with:
      | Field             | Value         |
      | Name              | <VendorName>  |
      | NameAlias         | <VendorName>  |
      | Group             | <VendorGroup> |
      | SalesTax_TaxGroup | <TaxGroup>    |

    And I expand the Addresses tab
    And I fill in the Addresses section with:
      | Field                 | Value        |
      | Description_label     | <VendorName> |
      | Roles_label           | Business     |
      | CountryRegionId_input | <Country>    |
      | ZipCode_label         | <ZipCode>    |
      | Street_label          | <Street>     |
      | City_label            | <City>       |
    And I expand the Contact information tab
    And I fill in the Contact Information section with:
      | Field                   | Value         |
      | ContactInfo_Description | <ContactName> |
      | ContactInfo_Type        | Email Address |
      | ContactInfo_Locator     | <Email>       |
    #And I set the contact role to Business for all contact types

    And I fill in the Purchase Order Defaults section with:
      | Field                    | Value          |
      | PurchPoolId_label        | <PurchasePool> |
      | Payment_PaymTermId_input | <PaymentTerm>  |
      | Delivery_DlvTerm_input   | <DeliveryTerm> |
    And I expand the Purchasing demographics tab
    And I fill in the Purchasing Demographics section with:
      | Field                   | Value           |
      | Currency_Currency_input | <Currency>      |
      | MainContactWorker       | <ContactWorker> |

    #And I expand the Purchase order defaults tab
    When I save the supplier record
    Then the supplier is created successfully
    #Then a new supplier ID is generated automatically


    Examples:
      | VendorName  | VendorGroup | TaxGroup | Country | ZipCode | Street            | City       | ContactName | Email                    | Currency | ContactWorker | PurchasePool | PaymentTerm | DeliveryTerm | SupplierType |
      | OV1EUSUP001 | 100         | UK_VEU   | DEU     | CH-5621 | Nougat Expressway | Leominster | Harry Bo    | RichardBagwell@ovgrp.com | EUR      | Miriam Menga  | PO Conf      | Net60       | FCA          | EU           |
#  | OV1UKSUP001  | 100         | UK_VDOM  | GBR     | SW1A 1AA | Oxford Street     | London     | John Smith  | JohnSmith@ovgrp.com      | GBP      | Emma Wilson   | PO Rush      | Net30       | EXW          | UK           |
# | OV1NORSUP001 | 100         | NO_VEU   | NOR     | 0150     | Oslo Avenue       | Oslo       | Anders Berg | AndersB@ovgrp.com        | NOK      | Knut Hansen   | PO Standard  | Net45       | CIF          | Nordic       |
# | OV1SWESUP001 | 100         | SE_VEU   | SWE     | 10165    | Stockholm Road    | Stockholm  | Lars Soren  | LarsSoren@ovgrp.com      | SEK      | Britta Olsson | PO Conf      | Net60       | FOB          | Sweden       |
