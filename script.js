document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('#terminal');
    const output = document.querySelector('#output');
    const commandInput = document.querySelector('#command-input');
    const commandHistory = [];
    let historyIndex = -1;
    let currentTypingTimeout = null;
    let isInputLocked = false; // 入力ロック用フラグ
    const commandHistoryKey = 'commandHistory'; // 履歴保存用キー
    const availableCommands = ['help', 'clear', 'echo', 'hobby', 'github', 'name']; // コマンド候補
    const themeSelector = document.querySelector('#theme'); // テーマセレクタ

    const hobby = 'プロレス\nダーツ\nビリヤード';
    const github = 'https://github.com/mashiro7676';
    const producer = 'Kobayashi Mahiro';

    // 履歴ロードf
    function loadHistory() {
        const savedHistory = localStorage.getItem(commandHistoryKey);
        if (savedHistory) {
            commandHistory.push(...JSON.parse(savedHistory));
        }
    }

    // 履歴保存
    function saveHistory() {
        localStorage.setItem(commandHistoryKey, JSON.stringify(commandHistory));
    }

    // テーマ適用
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
    }

    // 初期化
    loadHistory();
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(savedTheme);
    themeSelector.value = savedTheme;

    typeText('ウェブサイトへようこそ！');
    setTimeout(() => {
        executeCommand('help');
    }, 1500);

    commandInput.focus();

    // フォーカス管理（テーマセレクタを除外）
    document.addEventListener('click', (e) => {
        if (e.target.closest('#theme-selector')) {
            return; // テーマセレクタをクリックした場合はフォーカスを移動しない
        }
        if (!isInputLocked) commandInput.focus();
    });

    function typeText(text, isCommand = false, isHtml = false) {
        if (currentTypingTimeout) {
            clearTimeout(currentTypingTimeout);
        }

        const line = document.createElement('div');
        line.className = 'output-line typing';

        if (isCommand) {
            line.textContent = '> ' + text;
        } else if (isHtml) {
            line.innerHTML = text;
        } else {
            line.textContent = '';
            let currentChar = 0;

            function type() {
                if (currentChar < text.length) {
                    line.textContent += text[currentChar];
                    currentChar++;
                    currentTypingTimeout = setTimeout(type, 30);
                } else {
                    line.classList.remove('typing');
                    currentTypingTimeout = null;
                    unlockInput(); // 入力再開
                }
            }

            output.appendChild(line);
            type();
            terminal.scrollTop = terminal.scrollHeight;
            return;
        }

        output.appendChild(line);
        line.classList.remove('typing');
        terminal.scrollTop = terminal.scrollHeight;
        unlockInput(); // 入力再開
    }

    function executeCommand(command) {
        const cmd = command.trim().toLowerCase();
        if (cmd === '') return;

        typeText(command, true);

        if (!command.startsWith('__auto__')) {
            commandHistory.push(command);
            saveHistory(); // 履歴保存
            historyIndex = commandHistory.length;
        }

        lockInput(); // 入力ロック

        switch (true) {
            case cmd === 'help':
                typeText(
                    '利用可能なコマンド:\n' +
                    '  help     - このヘルプメッセージを表示\n' +
                    '  clear    - 画面をクリア\n' +
                    '  echo     - 指定されたメッセージを表示\n' +
                    '  hobby    - 趣味を表示\n' +
                    '  github   - GitHubのURLを表示\n' +
                    '  name     - 製作者の名前を表示'
                );
                break;

            case cmd === 'clear':
                output.innerHTML = '';
                setTimeout(() => {
                    executeCommand('help');
                }, 100);
                break;

            case cmd === 'hobby':
                typeText(hobby);
                break;

            case cmd === 'github':
                typeText(`GitHub: <a href="${github}" target="_blank" class="github-link">${github}</a>`, false, true);
                break;

            case cmd === 'name':
                typeText(`製作者: ${producer}`);
                break;

            case cmd.startsWith('echo '):
                const message = command.slice(5).trim();
                if (message) {
                    typeText(message);
                }
                break;

            default:
                typeText(`Error: コマンド '${command}' は認識されません。\n'help' と入力してコマンド一覧を確認してください。`);
        }
    }

    function lockInput() {
        isInputLocked = true;
        commandInput.disabled = true;
    }

    function unlockInput() {
        isInputLocked = false;
        commandInput.disabled = false;
        commandInput.focus();
    }

    // キーボード入力処理
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isInputLocked) {
            const command = commandInput.value;
            commandInput.value = '';
            executeCommand(command);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                commandInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const inputText = commandInput.value;
            const matchingCommands = availableCommands.filter(cmd => cmd.startsWith(inputText));
            if (matchingCommands.length === 1) {
                commandInput.value = matchingCommands[0];
            } else if (matchingCommands.length > 1) {
                typeText(`候補: ${matchingCommands.join(', ')}`);
            }
        }
    });

    // テーマ切り替えイベントリスナー
    themeSelector.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
});
