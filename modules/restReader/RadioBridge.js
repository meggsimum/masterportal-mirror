/**
 * The Radio Channel RestReader is no longer available in the "new" restReader (src/app-store).
 * This file is used for communication between this module and the new RestReader.
 * It can be deleted, if all modules using RestReader have been refactored.
 */
import store from "../../src/app-store";

Radio.channel("RestReader").reply({
    "getServiceById": function (serviceId) {
        const result = store.getters.getRestServiceById(String(serviceId));

        return result ? {get: (key) => result[key]} : undefined;
    }
});
