let sys = client.registerSystem(0, 0);

sys.initialize = function() {
	sys.listenForEvent("minecraft:client_entered_world", (eventData) => sys.broadcastEvent("my:player_joined", eventData));
};
