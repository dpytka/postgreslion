function DatabasesCtrl($scope) {

    var socket = io.connect();
    socket.on('database_created', function (data) {
        $scope.$apply(function(){
            $scope.dbs.push({url: data.url});
        });
    });

    $scope.dbs = [];

    $scope.addDb = function () {
        socket.emit('create_db', 'Message Sent on ' + new Date());
    };
}
