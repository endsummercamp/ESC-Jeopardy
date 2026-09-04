var ESC_JeopardyControllers = angular.module('ESC_JeopardyControllers', []);

var round = '_demo';

ESC_JeopardyControllers.controller('MusicControls', ['$scope', '$element',
  function ($scope, $element) {
    var audio = $element[0].querySelector('.theme-music');
    $scope.musicPlaying = false;
    $scope.musicError = '';

    function updatePlayback() {
      $scope.$evalAsync(function () {
        $scope.musicPlaying = !audio.paused;
      });
    }

    function playbackFailed() {
      $scope.$evalAsync(function () {
        $scope.musicPlaying = false;
        $scope.musicError = 'Musica non disponibile. Premi play per riprovare.';
      });
    }

    audio.addEventListener('play', updatePlayback);
    audio.addEventListener('pause', updatePlayback);
    audio.addEventListener('error', playbackFailed);

    $scope.toggleMusic = function () {
      $scope.musicError = '';
      if (audio.paused) {
        var playback = audio.play();
        if (playback && playback.catch) {
          playback.catch(playbackFailed);
        }
      } else {
        audio.pause();
      }
    };

    $scope.$on('$destroy', function () {
      audio.removeEventListener('play', updatePlayback);
      audio.removeEventListener('pause', updatePlayback);
      audio.removeEventListener('error', playbackFailed);
      audio.pause();
    });
  }
]);

ESC_JeopardyControllers.controller('LoadBoard', ['$scope', '$rootScope', '$http', 'localStorageService',
  function ($scope, $rootScope, $http, localStorageService) {
    if(localStorageService.get('boardstatus') === null ) {
      var boardstatus = new Array();
      boardstatus=[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
      $rootScope.boardstatus = boardstatus;
      localStorageService.set('boardstatus',boardstatus);
    } else {
      $rootScope.boardstatus = localStorageService.get('boardstatus');
    }  


    $http({ method: 'GET', url: 'games/round' + round + '.json' }).success(function (data) {
    var processed_data = new Array();

    var keys  = Object.keys(data);
    var cat_names = new Object();
    var col_number = 0;
    var question1 = new Object();
    var question2 = new Object();
    var question3 = new Object();
    var question4 = new Object();
    var question5 = new Object();

    for (var chiave in keys) {
      cat_names[parseInt(chiave)+1] = data[keys[chiave]][0];
      question1[parseInt(chiave)+1] = data[keys[chiave]][1];
      question2[parseInt(chiave)+1] = data[keys[chiave]][2];
      question3[parseInt(chiave)+1] = data[keys[chiave]][3];
      question4[parseInt(chiave)+1] = data[keys[chiave]][4];
      question5[parseInt(chiave)+1] = data[keys[chiave]][5];
      col_number++;
    }
    col_number = Math.floor(12/col_number);

    processed_data['cat_names'] = cat_names;
    processed_data['question1'] = question1;
    processed_data['question2'] = question2;
    processed_data['question3'] = question3;
    processed_data['question4'] = question4;
    processed_data['question5'] = question5;
    processed_data['col_number'] = col_number;

    $scope.board = processed_data; // response data
  });
}]);

ESC_JeopardyControllers.controller('LoadQuestion', ['$scope', '$rootScope', '$http', '$routeParams', '$sce', 'localStorageService', 'hotkeys',
  function ($scope, $rootScope, $http, $routeParams, $sce, localStorageService, hotkeys) {
    if(localStorageService.get('boardstatus') === null ) {
      var boardstatus = new Array();
      boardstatus=[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
      $rootScope.boardstatus = boardstatus;
      localStorageService.set('boardstatus',boardstatus);
    } else {
      $rootScope.boardstatus = localStorageService.get('boardstatus');
    }   


    if(localStorageService.get('game') === null ) {
      var game = new Object();
      game.player_in_control = 1;
      $rootScope.game = game;
      localStorageService.set('game',game);
    } else {
      $rootScope.game = localStorageService.get('game');
    }

    $http({ method: 'GET', url: 'games/round' + round + '.json' }).success(function (data) {
      var current_question = data['category'+$routeParams.catId][$routeParams.questionId];
      $scope.current_question = current_question;
      if($scope.current_question.answer_type == "text"){
        $scope.current_question.answer = $sce.trustAsHtml(current_question.answer);
      }
      if($scope.current_question.question_type == "text"){
        $scope.current_question.question = $sce.trustAsHtml(current_question.question);
      }
      if (current_question.dailydouble=="no") {
        $rootScope.current_points=current_question.points;
      } else {
        $rootScope.current_points=current_question.points*2;
      }
        $rootScope.current_row=$routeParams.questionId;
        $rootScope.current_col=$routeParams.catId;
    });
}]);

ESC_JeopardyControllers.controller('Bootup', ['$scope', '$rootScope', '$http', 'localStorageService',
  function ($scope, $rootScope, $http, localStorageService) {
    if(localStorageService.get('boardstatus') === null ) {
      var boardstatus = new Array();
      boardstatus=[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
      $rootScope.boardstatus = boardstatus;
      localStorageService.set('boardstatus',boardstatus);
    } else {
      $rootScope.boardstatus = localStorageService.get('boardstatus');
    }  


    if(localStorageService.get('game') === null ) {
      var game = new Object();
      game.player_in_control = 1;
      $rootScope.game = game;
      localStorageService.set('game',game);
    } else {
      $rootScope.game = localStorageService.get('game');
    }

    if(localStorageService.get('players') === null ) {
      var players = new Object();
      players[1] = players[2] = players[3] = players[4] = players[5] = players[6] = {'name':'Player', 'score':0, 'status':0};
      players[7]= {'name':'ABCDEFH', 'score':99999, 'status':-1};
      $rootScope.players = players;
      localStorageService.set('players',players);
    } else {
      $rootScope.players = localStorageService.get('players');
    }
  }
]);

ESC_JeopardyControllers.controller('LoadPlayerSetup', ['$scope', '$rootScope', '$http', '$routeParams', 'localStorageService',
  function ($scope, $rootScope, $http, $routeParams, localStorageService) {
    if(localStorageService.get('boardstatus') === null ) {
      var boardstatus = new Array();
      boardstatus=[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
      $rootScope.boardstatus = boardstatus;
      localStorageService.set('boardstatus',boardstatus);
    } else {
      $rootScope.boardstatus = localStorageService.get('boardstatus');
    }  


    if(localStorageService.get('players') === null ) {
      var players = new Object();
      players[1] = players[2] = players[3] = players[4] = players[5] = players[6] = {'name':'Player', 'score':0, 'status':0};
      players[7]= {'name':'ABCDEFH', 'score':99999, 'status':-1};
      $rootScope.players = players;
      localStorageService.set('players',players);
    } else {
      $rootScope.players = localStorageService.get('players');
    }

    $scope.player = $rootScope.players[$routeParams.playerId];


    $scope.updatePlayer = function() {
      if ($scope.player.name != "") {
        $rootScope.players[$routeParams.playerId]["name"] = $scope.player.name;
        localStorageService.set('players',$rootScope.players);
      }
    };
  }
]);

ESC_JeopardyControllers.controller('PlayersInterface', ['$scope', '$rootScope', '$http', 'localStorageService', 'hotkeys',
  function ($scope, $rootScope, $http, localStorageService, hotkeys) {
    if(localStorageService.get('boardstatus') === null ) {
      var boardstatus = new Array();
      boardstatus=[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
      $rootScope.boardstatus = boardstatus;
      localStorageService.set('boardstatus',boardstatus);
    } else {
      $rootScope.boardstatus = localStorageService.get('boardstatus');
    }    

    if(localStorageService.get('game') === null ) {
      var game = new Object();
      game.player_in_control = 1;
      $rootScope.game = game;
      localStorageService.set('game',game);
    } else {
      $rootScope.game = localStorageService.get('game');
    }

    if(localStorageService.get('players') === null ) {
      var players = new Object();
      players[1] = players[2] = players[3] = players[4] = players[5] = players[6] = {'name':'Player', 'score':0, 'status':0};
      players[7]= {'name':'ABCDEFH', 'score':99999, 'status':-1};
      $rootScope.players = players;
      localStorageService.set('players',players);
    } else {
      $rootScope.players = localStorageService.get('players');
    }

    hotkeys.add({
      combo: '1',
      description: 'Select player 1',
      callback: function() {
        $rootScope.game.player_in_control = 1;
        localStorageService.set('game',$rootScope.game);
      }
    });
    hotkeys.add({
      combo: '2',
      description: 'Select player 2',
      callback: function() {
        $rootScope.game.player_in_control = 2;
        localStorageService.set('game',$rootScope.game);
      }
    });
    hotkeys.add({
      combo: '3',
      description: 'Select player 3',
      callback: function() {
        $rootScope.game.player_in_control = 3;
        localStorageService.set('game',$rootScope.game);
      }
    });
    hotkeys.add({
      combo: '4',
      description: 'Select player 4',
      callback: function() {
        $rootScope.game.player_in_control = 4;
        localStorageService.set('game',$rootScope.game);
      }
    });
    hotkeys.add({
      combo: '5',
      description: 'Select player 5',
      callback: function() {
        $rootScope.game.player_in_control = 5;
        localStorageService.set('game',$rootScope.game);
      }
    });
    hotkeys.add({
      combo: '6',
      description: 'Select player 6',
      callback: function() {
        $rootScope.game.player_in_control = 6;
        localStorageService.set('game',$rootScope.game);
      }
    });
    hotkeys.add({
      combo: '7',
      description: 'All players fail',
      callback: function() {
        $rootScope.game.player_in_control = 7;
        localStorageService.set('game',$rootScope.game);
      }
    });

    hotkeys.add({
      combo: 'alt+y',
      description: 'You are awesome',
      callback: function() {
        var playerstatus = $rootScope.players[$rootScope.game.player_in_control];
        var oldpoints = parseInt(playerstatus.score);
        var newpoints = oldpoints + parseInt($rootScope.current_points);
        $rootScope.players[$rootScope.game.player_in_control].score = newpoints;
        localStorageService.set('players',$rootScope.players);

        $rootScope.boardstatus[$rootScope.current_col-1][$rootScope.current_row-1]=$rootScope.game.player_in_control;
        localStorageService.set('boardstatus',$rootScope.boardstatus);
      }
    });

    hotkeys.add({
      combo: 'alt+n',
      description: 'You are an idiot',
      callback: function() {
        var playerstatus = $rootScope.players[$rootScope.game.player_in_control];
        var oldpoints = parseInt(playerstatus.score);
        var newpoints = oldpoints - parseInt($rootScope.current_points);
        $rootScope.players[$rootScope.game.player_in_control].score = newpoints;
        localStorageService.set('players',$rootScope.players);

        $rootScope.boardstatus[$rootScope.current_col-1][$rootScope.current_row-1]=0;
        localStorageService.set('boardstatus',$rootScope.boardstatus);
      }
    });

    hotkeys.add({
      combo: 'shift+b',
      description: 'Return to board',
      callback: function() {
        window.location.assign("#/board")
      }
    });

    hotkeys.add({
      combo: 'shift+q',
      description: 'Show question',
      callback: function() {
        window.location.assign("#/question/"+$rootScope.current_col+"/"+$rootScope.current_row)
      }
    });








  }
]);
