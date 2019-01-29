let sys = client.registerSystem(0, 0);
let playerEntity;

sys.initialize = function() {
	// 玩家加入
	sys.listenForEvent("minecraft:client_entered_world", (eventData) => {
		playerEntity = eventData.player;
		sys.broadcastEvent("my:player_joined", playerEntity)
	});
};

// 玩家退出
sys.shutdown = function () {
	sys.broadcastEvent("my:player_exited", playerEntity);
};