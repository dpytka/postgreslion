function DatabasesCtrl($scope) {

    $scope.socket = io.connect();
    $scope.socket.on('database_created', function (data) {
        $scope.dbs.push({url: data.url});
        $scope.update();
    });

    $scope.update = function() {

    };

    $scope.dbs = [];

    $scope.addDb = function () {
        $scope.socket.emit('create_db', 'Message Sent on ' + new Date());
    };
}