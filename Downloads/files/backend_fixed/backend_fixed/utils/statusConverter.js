// Convert frontend status (UPPERCASE) to backend status (camelCase)
const FRONTEND_TO_BACKEND = {
  "AVAILABLE": "Available",
  "ON_TRIP": "OnTrip",
  "IN_SHOP": "InShop",
  "RETIRED": "Retired",
  "ON_DUTY": "OnDuty",
  "OFF_DUTY": "OffDuty",
  "SUSPENDED": "Suspended",
  "DISPATCHED": "Dispatched",
  "COMPLETED": "Completed",
  "CANCELLED": "Cancelled",
  "DRAFT": "Draft",
  "OPEN": "Open",
  "CLOSED": "Closed",
};

// Convert backend status (camelCase) to frontend status (UPPERCASE)
const BACKEND_TO_FRONTEND = {
  "Available": "AVAILABLE",
  "OnTrip": "ON_TRIP",
  "InShop": "IN_SHOP",
  "Retired": "RETIRED",
  "OnDuty": "ON_DUTY",
  "OffDuty": "OFF_DUTY",
  "Suspended": "SUSPENDED",
  "Dispatched": "DISPATCHED",
  "Completed": "COMPLETED",
  "Cancelled": "CANCELLED",
  "Draft": "DRAFT",
  "Open": "OPEN",
  "Closed": "CLOSED",
};

const convertFrontendStatus = (frontendStatus) => {
  return FRONTEND_TO_BACKEND[frontendStatus] || frontendStatus;
};

const convertBackendStatus = (backendStatus) => {
  return BACKEND_TO_FRONTEND[backendStatus] || backendStatus;
};

module.exports = { convertFrontendStatus, convertBackendStatus };
