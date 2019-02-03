module.exports = {
    AfterUberX: {
        sandbox: true,
        client_id: 'client_id',
        client_secret: 'client_secret',
        server_token: 'server_token',
        redirect_uri: ''
    },
    geocoder: {
        provider: 'google',
        // Optional depending on the providers
        httpAdapter: 'https', // Default
        apiKey: 'apiKey', // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    }
};
