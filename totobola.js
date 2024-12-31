document.addEventListener('DOMContentLoaded', function () {
    var Status1 = document.getElementById('Status1');
    var StatusX = document.getElementById('StatusX');
    var Status2 = document.getElementById('Status2');
    var botao = document.getElementById('botao');

    // Add event listeners to all checkboxes
    for (var i = 1; i <= 13; i++) {
        document.getElementById('Jogo' + i + '_1').addEventListener('click', boxClicked);
        document.getElementById('Jogo' + i + '_x').addEventListener('click', boxClicked);
        document.getElementById('Jogo' + i + '_2').addEventListener('click', boxClicked);
    }

    function boxClicked() {
        var apostasValidas = 0;
        var selected1 = 0;
        var selectedX = 0;
        var selected2 = 0;

        // Loop to check the options of each game
        for (var i = 1; i <= 13; i++) {
            var x = document.getElementById('Jogo' + i + '_1').checked;
            var y = document.getElementById('Jogo' + i + '_x').checked;
            var z = document.getElementById('Jogo' + i + '_2').checked;

            // If any of the checkboxes are checked, it's a valid bet
            if (x || y || z) apostasValidas += 1;
            if (x) selected1 += 1;
            if (y) selectedX += 1;
            if (z) selected2 += 1;
        }

        // Call the function to update the status based on the selections
        setStatus(selected1, selectedX, selected2, apostasValidas);
    }

    function setStatus(selected1, selectedX, selected2, apostasValidas) {
        // Update the number of selections of each type
        Status1.innerText = selected1;
        StatusX.innerText = selectedX;
        Status2.innerText = selected2;

        // The button remains always enabled, no condition to disable it
        botao.disabled = true; // Ensure button stays enabled
    }
});
