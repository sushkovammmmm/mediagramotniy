// Переменные для отслеживания состояния игры
let currentQuestion = 0;
let score = 0;
let selectedQuestions = [];

// Получаем элементы DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const questionText = document.getElementById('question-text');
const answerButtons = document.querySelectorAll('.answer-btn');
const currentScoreElement = document.getElementById('current-score');
const currentQuestionElement = document.getElementById('current-question');
const endMessage = document.getElementById('end-message');

// Функция для выбора случайных вопросов
function selectRandomQuestions() {
    // Создаем копию массива вопросов
    const availableQuestions = [...questionsDatabase];
    selectedQuestions = [];

    // Выбираем 15 случайных вопросов
    for (let i = 0; i < 15 && availableQuestions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        selectedQuestions.push(availableQuestions[randomIndex]);
        availableQuestions.splice(randomIndex, 1);
    }
}

// Функция для начала игры
function startGame() {
    selectRandomQuestions();
    currentQuestion = 0;
    score = 0;
    updateScore();
    showQuestion();
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');
}

// Функция для показа вопроса
function showQuestion() {
    const question = selectedQuestions[currentQuestion];
    questionText.textContent = question.question;
    currentQuestionElement.textContent = currentQuestion + 1;

    answerButtons.forEach((button, index) => {
        button.textContent = question.answers[index];
        button.classList.remove('correct', 'wrong');
        button.disabled = false;
    });
}

// Функция для проверки ответа
function checkAnswer(selectedIndex) {
    const question = selectedQuestions[currentQuestion];
    const selectedButton = answerButtons[selectedIndex];
    const correctButton = answerButtons[question.correct];

    // Отключаем все кнопки
    answerButtons.forEach(button => button.disabled = true);

    if (selectedIndex === question.correct) {
        selectedButton.classList.add('correct');
        score += 100;
        updateScore();

        // Переход к следующему вопросу
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < selectedQuestions.length) {
                showQuestion();
            } else {
                endGame(true);
            }
        }, 1500);
    } else {
        selectedButton.classList.add('wrong');
        correctButton.classList.add('correct');
        setTimeout(() => {
            endGame(false);
        }, 1500);
    }
}

// Функция для обновления счета
function updateScore() {
    currentScoreElement.textContent = score;
}

// Функция для завершения игры
function endGame(isWin) {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    if (isWin) {
        endMessage.textContent = 'Поздравляю, вы - медиаграмотный!';
    } else {
        endMessage.textContent = `Игра окончена! Ваш счет: ${score}`;
    }
}

// Добавляем обработчики событий
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

answerButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedIndex = parseInt(button.dataset.index);
        checkAnswer(selectedIndex);
    });
}); 