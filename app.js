(function() {
	var app = angular.module('brdaStats', []);

	app.config(function($locationProvider){
		$locationProvider.html5Mode(true);
	});

	app.controller('StatsController', [ '$http', function($http) {
		var self = this;
		
		this.members = [];
		this.games = [];

		this.currentGame = null;
		this.currentMember = null;

		$http.get('endpoints.php', { params: { op: 'getAllPlayers' } }).success(function(result) { self.members = result; });
		$http.get('endpoints.php', { params: { op: 'getAllGames' } }).success(function(result) { self.games = result; });
				
		this.setMember = function(obj) {
			var self = this;
			
			this.currentGame = null;
			this.currentMember = obj;
			
			$http.get('endpoints.php', { params: { op: 'getGamesByPlayer', id: obj.id } }).success(function(result) { self.currentMember.games = result; });
		};

		this.setGame= function(obj) {
			var self = this;
			
			this.currentMember = null;
			this.currentGame = obj;

			$http.get('endpoints.php', { params: { op: 'getPlayersByGame', id: obj.id } }).success(function(result) { self.currentGame.players = result; });
		};

		this.isCurrentMember = function(id) {
			return this.currentMember && this.currentMember.id === id;
		}
		
		this.isCurrentGame= function(id) {
			return this.currentGame && this.currentGame.id === id;
		}
		
		this.resetCurrent = function() {
			this.currentGame = null;
			this.currentMember = null;
		};
	}]);
	
	app.controller('PanelController', function() {
		this.tab = 'members';				// replaces ng-init
		
		this.selectTab = function(setTab) {	// replaces ng-click expression
			this.tab = setTab;
		};
		this.isSelected = function(checkTab) {
			return this.tab === checkTab;
		};
	});

	app.controller('MessagesController', ['$http', '$location', function($http,$location){
		self = this;
	
		self.steamIDLong = $location.search()['openid.identity'];
		self.requestID = $location.search()['requestID'].replace(/"/g,"");

		var reSteamID = /(\d+)$/g;
		var matches = reSteamID.exec(this.steamIDLong);
		self.steamID = matches[0];

		$http.get('endpoints.php', {
			params: {
				op:		'validateRequestID',
				requestID:	this.requestID
			}
		}).success(function(data){
			if(data == "error!") {self.message = "Error";}
			else if(data == "timeout"){self.message = "Timeout";}
			else if(typeof data.uuid != 'undefined'){	//Successful validation of CSRF Token
				console.log("Logged in: " + data.uuid);
				$http.get('endpoints.php',{
					params: {
						op:		'getPlayer',
						id:		self.steamID
					}
				}).success(function(data){
					self.message = "Welcome, " + data[0].username;	
				}).error(function(){console.log("ERROR");});
			}
			else{self.message = "Error";}
		});
	}]);
})();
