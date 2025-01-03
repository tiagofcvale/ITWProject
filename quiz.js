const quizData = [
    
    {
        "question": "Which team has won the most FIFA World Cup titles?",
        "options": ["Germany", "Italy", "Brazil", "Argentina"],
        "answer": 2,
        "image": "https://media.npr.org/assets/img/2022/12/19/gettyimages-1450300260_custom-ffc0f3a3b6d3a067f6295d8a1f4d5feb2f85d2c2.jpg?s=1100&c=85&f=jpeg"
    },
    {
        "question": "Who is the athlete with the most Olympic gold medals in history?",
        "options": ["Usain Bolt", "Michael Phelps", "Carl Lewis", "Mark Spitz"],
        "answer": 1,
        "image": "https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_xl_2x/f_auto/primary/hhfs9tf9mck02d8ilnqq"
    },
    {
        "question": "Which country has won the most Rugby World Cup titles?",
        "options": ["New Zealand", "South Africa", "Australia", "England"],
        "answer": 0,
        "image": "https://upload.wikimedia.org/wikipedia/commons/0/00/RWC_2011_final_FRA_-_NZL_McCaw_with_Ellis_Cup.jpg"
    },
    {
        "question": "Which city has hosted the Summer Olympics the most times?",
        "options": ["London", "Tokyo", "Paris", "Los Angeles"],
        "answer": 0,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyWu0HbooAPUSO7nll1Ch7m61ZG3tbqHjF8A&s"
    },
    {
        "question": "Who is the football player with the most Ballon d'Or awards?",
        "options": ["Lionel Messi", "Cristiano Ronaldo", "Johan Cruyff", "Michel Platini"],
        "answer": 0,
        "image": "https://static01.nyt.com/images/2016/12/13/sports/13ronaldo/13ronaldo-superJumbo.jpg"
    },
    {
        "question": "Which nation has won the most Davis Cup titles in tennis?",
        "options": ["USA", "Australia", "France", "Spain"],
        "answer": 0,
        "image": "https://www.japantimes.co.jp/uploads/imported_images/uploads/2022/11/np_file_191356.jpeg"
    },
    {
        "question": "Which country has won the most Cricket World Cup titles?",
        "options": ["India", "Australia", "England", "West Indies"],
        "answer": 1,
        "image": "https://res.cloudinary.com/icc-web/image/private/t_ratio16_9-size50/v1698253141/prd/assets/static_pages/about-icc-champions-trophy.jpg"
    },
    {
        "question": "Who holds the record for the most goals scored in FIFA World Cup history?",
        "options": ["Pele", "Miroslav Klose", "Ronaldo Nazário", "Lionel Messi"],
        "answer": 1,
        "image": "https://static01.nyt.com/images/2014/06/22/sports/on-soccer/on-soccer-superJumbo.jpg"
    },
    {
        "question": "Which country has the most Winter Olympic medals overall?",
        "options": ["Norway", "Canada", "Germany", "USA"],
        "answer": 0,
        "image": "https://cdn.britannica.com/90/198290-050-12A37C4E/Alberto-Tomba-gold-medal-way-Mens-Giant-1992.jpg"
    },
    {
        "question": "Which athlete has the most gold medals in a single Olympic Games?",
        "options": ["Usain Bolt", "Michael Phelps", "Carl Lewis", "Mark Spitz"],
        "answer": 3,
        "image": "https://www.olimpiadatododia.com.br/wp-content/uploads/2020/08/mark-spitz.jpg"
    },
    {
        "question": "Which team has won the most UEFA Champions League titles?",
        "options": ["Real Madrid", "Barcelona", "AC Milan", "Liverpool"],
        "answer": 0,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6bffEJa9Xx7ILnjE11aFrCU-OBsAavzcAxA&s"
    },
    {
        "question": "Which nation has won the most Olympic gold medals in swimming?",
        "options": ["USA", "Australia", "China", "Russia"],
        "answer": 0,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5cUDAcOJKHE3iDvrDtXyYpg8qnVnqa9LzAA&s"
    },
    {
        "question": "Which country has won the most medals in athletics in Olympic history?",
        "options": ["USA", "Jamaica", "Russia", "Germany"],
        "answer": 0,
        "image": "https://therunningchannel.com/wp-content/uploads/2024/07/PARIS-MEDALS-1-.jpg"
    },
    {
        "question": "Who is the youngest ever Formula 1 World Champion?",
        "options": ["Lewis Hamilton", "Sebastian Vettel", "Max Verstappen", "Fernando Alonso"],
        "answer": 1,
        "image": "https://www.formula1.com/perez-win-baku-parc-ferme.png"
    },
    {
        "question": "Which country has the most victories in the Tour de France?",
        "options": ["France", "Belgium", "Spain", "USA"],
        "answer": 0,
        "image": "https://road.shimano.com/stories/easset_upload_file57038_367336_e.jpg"
    }
    
];

let currentQuestionIndex = 0;
let score = 0;

const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const questionText = document.getElementById("question-text");
const questionImage = document.getElementById("question-image");
const optionsList = document.getElementById("options");
const feedback = document.getElementById("feedback");
const resultContainer = document.getElementById("result");
const quizContainer = document.getElementById("quiz");
const scoreText = document.getElementById("score");
const progressText = document.getElementById("questions-answered");

startButton.addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);

function startQuiz() {
    startButton.style.display = "none";
    document.getElementById("intro-text").style.display = "none";
    quizContainer.style.display = "block";
    loadQuestion();
}

function loadQuestion() {
    const questionData = quizData[currentQuestionIndex];
    questionText.textContent = questionData.question;
    questionImage.src = questionData.image;
    optionsList.innerHTML = "";
    feedback.textContent = "";
    nextButton.style.display = "none";

    questionData.options.forEach((option, index) => {
        const li = document.createElement("li");
        li.textContent = option;
        li.addEventListener("click", () => checkAnswer(index, li));
        optionsList.appendChild(li);
    });

    updateProgress();
}

function checkAnswer(selectedIndex, selectedElement) {
    const correctAnswer = quizData[currentQuestionIndex].answer;

    
    const options = document.querySelectorAll("#options li");
    options.forEach(option => option.style.pointerEvents = "none");

    if (selectedIndex === correctAnswer) {
        score++;
        selectedElement.style.backgroundColor = "green";
        feedback.textContent = "Correct Answer!";
        feedback.style.color = "green";
    } else {
        selectedElement.style.backgroundColor = "red";
        feedback.textContent = "Wrong Answer!";
        feedback.style.color = "red";
        options[correctAnswer].style.backgroundColor = "green"; // Mostra a resposta correta
    }

    nextButton.style.display = "block";
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";
    scoreText.textContent = `You got ${score} of ${quizData.length} questions right!`;
}

function restartQuiz() {
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;

    // Hide result section and show quiz intro
    document.getElementById('result').style.display = 'none';
    document.getElementById('quiz-intro').style.display = 'block';

    // Reset other elements if necessary
    document.getElementById('questions-answered').innerText = 'Question 1 of 15';
    document.getElementById('question-text').innerText = '';
    document.getElementById('question-image').src = '';
    document.getElementById('options').innerHTML = '';
    document.getElementById('feedback').innerText = '';
    document.getElementById('next-button').style.display = 'none';
}


function updateProgress() {
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
}

document.getElementById("start-button").addEventListener("click", function () {
    document.getElementById("quiz-intro").style.display = "none";
    document.getElementById("quiz").style.display = "block";
});
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');

    document.addEventListener('mousemove', function (event) {
        if (event.clientY < 50) {
            navbar.classList.remove('navbar-hidden');
        } else {
            navbar.classList.add('navbar-hidden');
        }
    });
});