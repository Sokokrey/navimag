import { connect } from 'mqtt';

const mqtt_options = {
    host: 'localhost',
    port: 1883,
    // username: 'ecmc',
    // password: 'Ecmc2011!',
    clientId: `MQTT_SERVER`,
    rejectUnauthorized: false
};

const client = connect(mqtt_options);

export default client;