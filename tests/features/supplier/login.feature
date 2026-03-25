@authentication
Feature: Authentication - Primary Login Flow

  Background:
    Given I navigate to the Microsoft login page
  #And the sign-in form is displayed


  Scenario: 1.1. Successful login with valid credentials and session storage
    When I enter a valid Orkla email address in the username field
    And I click the "Next" button
    And I enter a valid password
    And I click the "Sign In" button
    And I complete MFA if prompted
    Then I should be redirected to the Orkla dashboard
    And the authenticated session should be stored to "auth.json"
    And the "auth.json" file should contain valid session cookies