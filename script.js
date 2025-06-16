// Переменные для отслеживания состояния игры
let currentQuestion = 0;
let score = 0;
let questions = [];

// Добавляем переменные для подсказок
let hints = {
    fiftyFifty: true,
    callFriend: true,
    audienceHelp: true
};

// Получаем элементы DOM
const startScreen = document.getElementById('start-screen');
const rulesScreen = document.getElementById('rules-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const winScreen = document.getElementById('win-screen');
const startButton = document.getElementById('start-button');
const startGameButton = document.getElementById('start-game-button');
const restartButton = document.getElementById('restart-button');
const questionText = document.getElementById('question-text');
const answerButtons = document.querySelectorAll('.answer-btn');
const currentScoreElement = document.getElementById('current-score');
const currentQuestionElement = document.getElementById('current-question');
const endMessage = document.getElementById('end-message');

// Получаем элементы подсказок
const fiftyFiftyBtn = document.getElementById('fifty-fifty');
const callFriendBtn = document.getElementById('call-friend');
const audienceHelpBtn = document.getElementById('audience-help');
const callFriendModal = document.getElementById('call-friend-modal');
const audienceModal = document.getElementById('audience-modal');
const closeModalBtn = document.getElementById('close-modal');
const closeAudienceModalBtn = document.getElementById('close-audience-modal');
const friendAnswer = document.getElementById('friend-answer');
const hint5050Button = document.getElementById('hint-5050');
const hintCallButton = document.getElementById('hint-call');
const hintAudienceButton = document.getElementById('hint-audience');
const hint5050Used = document.getElementById('hint-5050-used');
const hintCallUsed = document.getElementById('hint-call-used');
const hintAudienceUsed = document.getElementById('hint-audience-used');

// Функция для перемешивания массива (алгоритм Фишера-Йейтса)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Функция для перемешивания ответов
function shuffleAnswers(question) {
    const answers = [...question.answers];
    const correctAnswer = answers[question.correct];
    
    // Перемешиваем все ответы
    shuffleArray(answers);
    
    // Находим новый индекс правильного ответа
    const newCorrectIndex = answers.indexOf(correctAnswer);
    
    return {
        question: question.question,
        answers: answers,
        correct: newCorrectIndex
    };
}

// Функция для начала игры
function startGame() {
    // Заполняем массив questions из базы и перемешиваем
    questions = shuffleArray([...questionsDatabase]);
    questions = questions.slice(0, 15);
    questions = questions.map(shuffleAnswers);

    // Скрываем экран с правилами, показываем игровой экран
    rulesScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    // Сброс состояния
    currentQuestion = 0;
    score = 0;
    updateScore();
    resetHints();
    showQuestion();
}

// Функция для показа вопроса
function showQuestion() {
    const question = questions[currentQuestion];
    questionText.textContent = question.question;
    currentQuestionElement.textContent = currentQuestion + 1;

    answerButtons.forEach((button, index) => {
        button.textContent = question.answers[index];
        button.classList.remove('correct', 'wrong');
        button.disabled = false;
        // Удаляем старые обработчики событий
        button.removeEventListener('click', button.clickHandler);
        // Добавляем новый обработчик
        button.clickHandler = () => checkAnswer(index);
        button.addEventListener('click', button.clickHandler);
    });
}

// Функция для проверки ответа
function checkAnswer(selectedIndex) {
    const question = questions[currentQuestion];
    const selectedButton = answerButtons[selectedIndex];
    const correctButton = answerButtons[question.correct];

    // Отключаем все кнопки
    answerButtons.forEach(button => button.disabled = true);
    
    if (selectedIndex === question.correct) {
        playSound('sound-correct');
        selectedButton.classList.add('correct');
        score += 100;
        updateScore();
        
        if (currentQuestion === questions.length - 1) {
            // Если это был последний вопрос и ответ правильный
            setTimeout(() => {
                gameScreen.classList.add('hidden');
                winScreen.classList.remove('hidden');
            }, 1000);
        } else {
            currentQuestion++;
            setTimeout(showQuestion, 1000);
        }
    } else {
        playSound('sound-wrong');
        selectedButton.classList.add('wrong');
        correctButton.classList.add('correct');
        
        setTimeout(() => {
            gameScreen.classList.add('hidden');
            endScreen.classList.remove('hidden');
            document.getElementById('final-score').textContent = score;
        }, 1000);
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

// Функция для сброса подсказок
function resetHints() {
    hints = {
        fiftyFifty: true,
        callFriend: true,
        audienceHelp: true
    };
    document.getElementById('fifty-fifty').classList.remove('used');
    document.getElementById('call-friend').classList.remove('used');
    document.getElementById('audience-help').classList.remove('used');
}

// Функция 50:50
function useFiftyFifty() {
    if (!hints.fiftyFifty) return;
    
    const question = questions[currentQuestion];
    const answerButtons = document.querySelectorAll('.answer-btn');
    const wrongAnswers = [];
    
    // Находим два неверных ответа
    answerButtons.forEach((button, index) => {
        if (index !== question.correct) {
            wrongAnswers.push(index);
        }
    });
    
    // Перемешиваем неверные ответы
    shuffleArray(wrongAnswers);
    
    // Убираем два неверных ответа
    wrongAnswers.slice(0, 2).forEach(index => {
        answerButtons[index].textContent = '';
        answerButtons[index].disabled = true;
    });
    
    // Отмечаем подсказку как использованную
    hints.fiftyFifty = false;
    document.getElementById('fifty-fifty').classList.add('used');
    playSound('sound-hint');
}

// Функция для создания круговой диаграммы
function createPieChart(correctIndex) {
    const chart = document.getElementById('audience-chart');
    chart.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    chart.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Создаем массив цветов для всех ответов
    const colors = Array(4).fill(null);
    // Устанавливаем цвета для неправильных ответов
    const wrongColors = ['#00BFFF', '#FFA500', '#808080']; // Голубой, оранжевый, серый
    let wrongColorIndex = 0;
    
    // Заполняем массив цветов
    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            colors[i] = '#4CAF50'; // Зеленый для правильного ответа
        } else {
            colors[i] = wrongColors[wrongColorIndex++];
        }
    }
    
    const percentages = [20, 20, 20, 20];
    percentages[correctIndex] = 40;
    
    let startAngle = 0;
    percentages.forEach((percentage, index) => {
        const sliceAngle = (percentage / 100) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        // Добавляем текст с процентами
        const textAngle = startAngle + sliceAngle / 2;
        const textRadius = radius * 0.7;
        const textX = centerX + textRadius * Math.cos(textAngle);
        const textY = centerY + textRadius * Math.sin(textAngle);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${percentage}%`, 0, 0);
        ctx.restore();
        
        startAngle += sliceAngle;
    });
}

// Функция звонка внуку
function useCallFriend() {
    if (!hints.callFriend) return;
    
    const question = questions[currentQuestion];
    const correctAnswer = question.answers[question.correct];
    
    // Показываем модальное окно
    document.getElementById('call-friend-modal').classList.remove('hidden');
    
    // Имитируем "размышление" внука
    setTimeout(() => {
        document.getElementById('friend-answer').textContent = `Я думаю, правильный ответ - ${correctAnswer}`;
    }, 1000);
    
    // Отмечаем подсказку как использованную
    hints.callFriend = false;
    document.getElementById('call-friend').classList.add('used');
    playSound('sound-hint');
}

// Функция помощи зала
function useAudienceHelp() {
    if (!hints.audienceHelp) return;
    
    const question = questions[currentQuestion];
    
    // Показываем модальное окно с диаграммой
    document.getElementById('audience-modal').classList.remove('hidden');
    
    // Обновляем легенду
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach((item, index) => {
        const colorBox = item.querySelector('.legend-color');
        if (index === question.correct) {
            colorBox.className = 'legend-color answer-correct';
        } else {
            colorBox.className = `legend-color answer-${index + 1}`;
        }
    });
    
    // Создаем круговую диаграмму
    createPieChart(question.correct);
    
    // Отмечаем подсказку как использованную
    hints.audienceHelp = false;
    document.getElementById('audience-help').classList.add('used');
    playSound('sound-hint');
}

// Добавляем обработчики событий
startButton.addEventListener('click', function() {
    startScreen.classList.add('hidden');
    rulesScreen.classList.remove('hidden');
    playSound('sound-start');
});

startGameButton.addEventListener('click', startGame);

restartButton.addEventListener('click', function() {
    startScreen.classList.remove('hidden');
    rulesScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
});

// Добавляем обработчики событий для подсказок
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для подсказок
    const fiftyFiftyBtn = document.getElementById('fifty-fifty');
    const callFriendBtn = document.getElementById('call-friend');
    const audienceHelpBtn = document.getElementById('audience-help');

    if (fiftyFiftyBtn) {
        fiftyFiftyBtn.addEventListener('click', function() {
            console.log('50:50 clicked');
            useFiftyFifty();
        });
    }
    if (callFriendBtn) {
        callFriendBtn.addEventListener('click', function() {
            console.log('Call friend clicked');
            useCallFriend();
        });
    }
    if (audienceHelpBtn) {
        audienceHelpBtn.addEventListener('click', function() {
            console.log('Audience help clicked');
            useAudienceHelp();
        });
    }

    // Обработчики для закрытия модальных окон
    document.getElementById('close-modal').onclick = function() {
        document.getElementById('call-friend-modal').classList.add('hidden');
        document.getElementById('friend-answer').textContent = '';
    };

    document.getElementById('close-audience-modal').onclick = function() {
        document.getElementById('audience-modal').classList.add('hidden');
    };
});

// Воспроизводим общий клик только для НЕ-ответных и НЕ-подсказочных кнопок
// (например, "Начать игру", "Играть снова")
document.querySelectorAll('button:not(.answer-btn):not(.hint-btn)').forEach(btn => {
    btn.addEventListener('click', () => playSound('sound-click'));
});

// Для подсказок — отдельный звук
// (кнопки с классом .hint-btn)
document.querySelectorAll('.hint-btn').forEach(btn => {
    btn.addEventListener('click', () => playSound('sound-hint'));
});

// Функция для воспроизведения звуков
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        try {
            sound.currentTime = 0;
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Ошибка воспроизведения звука:', error);
                });
            }
        } catch (error) {
            console.log('Ошибка при работе со звуком:', error);
        }
    } else {
        console.log('Звуковой элемент не найден:', id);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для кнопки "Начать игру" на стартовом экране
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', function() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('rules-screen').classList.remove('hidden');
            playSound('sound-start');
        });
    }

    // Обработчик для кнопки "Начать игру" на экране правил
    const startGameButton = document.getElementById('start-game-button');
    if (startGameButton) {
        startGameButton.addEventListener('click', startGame);
    }

    // Обработчики для закрытия модальных окон
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.onclick = function() {
            document.getElementById('call-friend-modal').classList.add('hidden');
            document.getElementById('friend-answer').textContent = '';
        };
    }

    const closeAudienceModalBtn = document.getElementById('close-audience-modal');
    if (closeAudienceModalBtn) {
        closeAudienceModalBtn.onclick = function() {
            document.getElementById('audience-modal').classList.add('hidden');
        };
    }
}); 