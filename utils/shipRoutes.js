// utils/shipRoutes.js
export const PH_PORTS = [
    { value: "manila", label: "Manila", lat: 14.5995, lng: 120.9842 },
    { value: "subic", label: "Subic", lat: 14.7946, lng: 120.271 },
    { value: "batangas", label: "Batangas", lat: 13.7565, lng: 121.0583 },
    { value: "cebu", label: "Cebu", lat: 10.3157, lng: 123.8854 },
    { value: "iloilo", label: "Iloilo", lat: 10.7202, lng: 122.5621 },
    { value: "bacolod", label: "Bacolod", lat: 10.6765, lng: 122.9511 },
    { value: "davao", label: "Davao", lat: 7.1907, lng: 125.4553 },
    {
        value: "cagayan-de-oro",
        label: "Cagayan de Oro",
        lat: 8.4542,
        lng: 124.6319
    },
    {
        value: "general-santos",
        label: "General Santos",
        lat: 6.1164,
        lng: 125.1716
    },
    { value: "zamboanga", label: "Zamboanga", lat: 6.9214, lng: 122.079 }
];

export const getPortByValue = value => {
    return PH_PORTS.find(port => port.value === value);
};
