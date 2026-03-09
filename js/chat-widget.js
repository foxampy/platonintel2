/**
 * Plato-Intel Online Chat Widget
 * Визуальный чат без бэкенда (заглушка для демонстрации)
 */

(function() {
    'use strict';

    // Конфигурация чата
    const config = {
        position: 'right',
        primaryColor: '#e76f51',
        greeting: 'Здравствуйте! Чем можем помочь?',
        workingHours: { start: 9, end: 17 },
        operators: [
            { name: 'Александр', avatar: 'assets/images/team/operator1.jpg', role: 'Технический специалист' },
            { name: 'Елена', avatar: 'assets/images/team/operator2.jpg', role: 'Менеджер по продажам' }
        ]
    };

    // Состояние чата
    let isOpen = false;
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    let currentOperator = config.operators[0];

    // Создание HTML структуры чата
    function createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'plato-chat-widget';
        widget.innerHTML = `
            <style>
                #plato-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    ${config.position}: 20px;
                    z-index: 9999;
                    font-family: 'Inter', sans-serif;
                }
                
                .chat-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${config.primaryColor}, #f4a261);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(231, 111, 81, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .chat-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(231, 111, 81, 0.5);
                }
                
                .chat-button svg {
                    width: 28px;
                    height: 28px;
                    fill: white;
                }
                
                .chat-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 20px;
                    height: 20px;
                    background: #e9c46a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: bold;
                    color: #1a1f2e;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                .chat-window {
                    position: absolute;
                    bottom: 80px;
                    ${config.position}: 0;
                    width: 380px;
                    height: 500px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 50px rgba(0,0,0,0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .chat-window.open {
                    display: flex;
                }
                
                .chat-header {
                    background: linear-gradient(135deg, #1a1f2e, #2d3748);
                    padding: 20px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .operator-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 3px solid ${config.primaryColor};
                    object-fit: cover;
                }
                
                .operator-info h4 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .operator-info span {
                    font-size: 12px;
                    opacity: 0.8;
                }
                
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 5px;
                    font-size: 11px;
                }
                
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #2ecc71;
                    border-radius: 50%;
                    animation: blink 2s infinite;
                }
                
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #f8f9fa;
                }
                
                .message {
                    margin-bottom: 15px;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                .message-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.5;
                    position: relative;
                }
                
                .message.operator .message-bubble {
                    background: white;
                    color: #2a3f54;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                
                .message.user {
                    display: flex;
                    justify-content: flex-end;
                }
                
                .message.user .message-bubble {
                    background: linear-gradient(135deg, ${config.primaryColor}, #f4a261);
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                
                .message-time {
                    font-size: 11px;
                    color: #999;
                    margin-top: 5px;
                    text-align: right;
                }
                
                .quick-replies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 0 20px 15px;
                    background: #f8f9fa;
                }
                
                .quick-reply {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .quick-reply:hover {
                    background: ${config.primaryColor};
                    color: white;
                    border-color: ${config.primaryColor};
                }
                
                .chat-input-area {
                    padding: 15px 20px;
                    background: white;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .chat-input:focus {
                    border-color: ${config.primaryColor};
                }
                
                .send-button {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: ${config.primaryColor};
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .send-button:hover {
                    background: #d65a3d;
                    transform: scale(1.05);
                }
                
                .send-button svg {
                    width: 20px;
                    height: 20px;
                    fill: white;
                }
                
                .typing-indicator {
                    display: none;
                    padding: 15px 20px;
                    background: #f8f9fa;
                }
                
                .typing-indicator.active {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .typing-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background: #999;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }
                
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-10px); }
                }
                
                .offline-message {
                    display: none;
                    padding: 15px;
                    background: #fff3cd;
                    border-radius: 10px;
                    margin: 15px;
                    font-size: 13px;
                    color: #856404;
                    text-align: center;
                }
                
                .offline-message.active {
                    display: block;
                }
                
                @media (max-width: 480px) {
                    .chat-window {
                        width: calc(100vw - 40px);
                        height: 60vh;
                        right: 0 !important;
                        left: 20px !important;
                    }
                }
            </style>
            
            <button class="chat-button" onclick="toggleChat()">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                <span class="chat-badge">1</span>
            </button>
            
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <img src="${currentOperator.avatar}" alt="${currentOperator.name}" class="operator-avatar" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23e76f51%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>${currentOperator.name[0]}</text></svg>'">
                    <div class="operator-info">
                        <h4>${currentOperator.name}</h4>
                        <span>${currentOperator.role}</span>
                        <div class="status-badge">
                            <span class="status-dot"></span>
                            <span id="statusText">Онлайн</span>
                        </div>
                    </div>
                </div>
                
                <div class="chat-messages" id="chatMessages"></div>
                
                <div class="typing-indicator" id="typingIndicator">
                    <span>${currentOperator.name} печатает</span>
                    <div class="typing-dots">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
                
                <div class="offline-message" id="offlineMessage">
                    Мы сейчас офлайн. Оставьте сообщение — мы ответим в рабочее время (Пн-Пт 9:00-17:00)
                </div>
                
                <div class="quick-replies">
                    <button class="quick-reply" onclick="sendQuickReply('Нужна консультация')">Нужна консультация</button>
                    <button class="quick-reply" onclick="sendQuickReply('Хочу узнать цены')">Хочу узнать цены</button>
                    <button class="quick-reply" onclick="sendQuickReply('Наличие на складе')">Наличие на складе</button>
                </div>
                
                <div class="chat-input-area">
                    <input type="text" class="chat-input" id="chatInput" 
                           placeholder="Введите сообщение..." 
                           onkeypress="handleKeyPress(event)">
                    <button class="send-button" onclick="sendMessage()">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }

    // Переключение окна чата
    window.toggleChat = function() {
        const window = document.getElementById('chatWindow');
        isOpen = !isOpen;
        window.classList.toggle('open', isOpen);
        
        if (isOpen && messages.length === 0) {
            // Первое открытие - показываем приветствие
            setTimeout(() => {
                addMessage('operator', config.greeting);
            }, 500);
        }
        
        if (isOpen) {
            document.getElementById('chatInput').focus();
            scrollToBottom();
        }
    };

    // Добавление сообщения
    function addMessage(sender, text) {
        const messagesContainer = document.getElementById('chatMessages');
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-bubble">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messages.push({ sender, text, time });
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        scrollToBottom();
    }

    // Отправка сообщения пользователя
    window.sendMessage = function() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        addMessage('user', text);
        input.value = '';
        
        // Имитация ответа оператора
        showTyping();
        setTimeout(() => {
            hideTyping();
            const response = generateResponse(text);
            addMessage('operator', response);
        }, 1500 + Math.random() * 1000);
    };

    // Быстрый ответ
    window.sendQuickReply = function(text) {
        document.getElementById('chatInput').value = text;
        sendMessage();
    };

    // Обработка нажатия Enter
    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    // Показать индикатор набора
    function showTyping() {
        document.getElementById('typingIndicator').classList.add('active');
        scrollToBottom();
    }

    // Скрыть индикатор набора
    function hideTyping() {
        document.getElementById('typingIndicator').classList.remove('active');
    }

    // Генерация ответа (заглушка)
    function generateResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('цена') || lowerMsg.includes('стоимость') || lowerMsg.includes('сколько')) {
            return 'Для расчета точной стоимости, пожалуйста, укажите интересующую модель и количество. Также вы можете заполнить форму заявки на нашем сайте — мы пришлем коммерческое предложение в течение 30 минут.';
        }
        
        if (lowerMsg.includes('наличие') || lowerMsg.includes('склад')) {
            return 'У нас есть собственный склад в Минске. Большинство позиций в наличии. Уточните артикул интересующего товара — я проверю наличие прямо сейчас.';
        }
        
        if (lowerMsg.includes('доставка') || lowerMsg.includes('доставить')) {
            return 'Доставляем по всей Беларуси и странам СНГ. По Минску — собственным транспортом или курьером. В регионы — транспортными компаниями. Срок доставки от 1 дня.';
        }
        
        if (lowerMsg.includes('гарантия')) {
            return 'На всю продукцию предоставляется гарантия производителя от 12 месяцев. Также осуществляем послегарантийное обслуживание и поставку запчастей.';
        }
        
        if (lowerMsg.includes('консультация') || lowerMsg.includes('помощь')) {
            return 'С удовольствием поможем! Наши специалисты подберут оборудование под ваши задачи. Расскажите подробнее: для какого крана/оборудования нужна продукция? Какие характеристики важны?'
        }
        
        return 'Благодарим за обращение! Для оперативного ответа рекомендую оставить ваш номер телефона — наш специалист перезвонит в ближайшее время. Или вы можете заполнить форму заявки на сайте.';
    }

    // Проверка рабочего времени
    function checkWorkingHours() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const isWorkingDay = day >= 1 && day <= 5;
        const isWorkingHour = hour >= config.workingHours.start && hour < config.workingHours.end;
        
        const offlineMessage = document.getElementById('offlineMessage');
        const statusText = document.getElementById('statusText');
        const statusDot = document.querySelector('.status-dot');
        
        if (offlineMessage) {
            offlineMessage.classList.toggle('active', !(isWorkingDay && isWorkingHour));
        }
        
        if (statusText) {
            if (isWorkingDay && isWorkingHour) {
                statusText.textContent = 'Онлайн';
                statusDot.style.background = '#2ecc71';
            } else {
                statusText.textContent = 'Офлайн';
                statusDot.style.background = '#e74c3c';
            }
        }
    }

    // Прокрутка к последнему сообщению
    function scrollToBottom() {
        const container = document.getElementById('chatMessages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        createChatWidget();
        checkWorkingHours();
        setInterval(checkWorkingHours, 60000); // Проверка каждую минуту
        
        // Восстановление истории сообщений
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer && messages.length > 0) {
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}`;
                messageDiv.innerHTML = `
                    <div class="message-bubble">${msg.text}</div>
                    <div class="message-time">${msg.time}</div>
                `;
                messagesContainer.appendChild(messageDiv);
            });
        }
    }
})();