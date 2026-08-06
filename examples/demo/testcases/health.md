# Requirement: Service health is observable

## Test Cases

### Scenario: Healthy service response

#### TestCase: TC-DEMO-HEALTH-0001 Catalog exposes the health contract

##### Priority

- P1

##### Preconditions

- The repository is a clean checkout using only synthetic demo assets.

##### Steps

###### Step 1

- **Action**: Open the API catalog and select the Synthetic Demo API.
- **Expected**: The `GET /health` operation is visible with a `200` response.

###### Step 2

- **Action**: Open the workflow catalog and select `verifyHealth`.
- **Expected**: The workflow links `readHealth` to the `getHealth` operation.
