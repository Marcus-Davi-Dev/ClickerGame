// !! A poção de reduão de delay pela metade permanente não funciona.
// Corrigido uma sintaxe errada que fazia com que os buffs de delay aumentassem o delay, ao invés de diminuir.
// Corrigido erro em que ao clicar na checkbox de desativar/reativar o dinheiro 2X permanente duas vezes a quantia de dinheiro ganha era dividida pelo multiplicador de dinheiro bônus atual.
// Agora o auto clicker subtrai uma quantia do dinheiro total, ao invés de ser de graça, como antes.
// Todas as funcionalidades de clicks manuais forma movidos para um Object, parecido como o do ato click.

// 
// elementos do container principal
// 
const image = document.querySelector("img");
const text = document.querySelector("#money-increase-text-1");
const text2 = document.querySelector("#money-increase-text-2");
const buttons1 = document.querySelector(".buttons1");
const buttons2 = document.querySelector(".buttons2");
// elemento que exibe a quantia atual de dinheiro
const moneyDisplayer = document.querySelector("#money-value");
// sub-elementos do container principal
const shopButton = document.querySelector(".shop-button");
const upgradesButton = document.querySelector(".upgrades-button");
const configButton = document.querySelector(".config-button");
const statsButton = document.querySelector(".stats-button");
const buttons = [shopButton, upgradesButton, configButton, statsButton];

//
// menus
//
const shopMenu = document.querySelector("#shop");
const upgradesMenu = document.querySelector("#upgrades");
const configMenu = document.querySelector("#config");
const statsMenu = document.querySelector("#stats");
const menus = [document.querySelector(".shop"), document.querySelector(".upgrades"), document.querySelector(".config"), document.querySelector(".stats")];

// botão para redimensionar os menus
const redimensionadores = document.querySelectorAll(".redimension");

// elementos do menu "upgrades"
const manual = {
    clickPower: 1,
    click: 1,
    multiplier: 100,
    clickDelay: 1000,
    buttons: { click: document.querySelector("#click-power"), multiplier: document.querySelector("#mult"), clickDelay: document.querySelector("#delay") },
    prices: { click: [10, 25, 100, 200, 350, 600, "max"], multiplier: [100, 200, 400, 700, 1000, 1250, 1600, "max"], clickDelay: [150, 300, 500, 600, 700, 800, 900, 1000, 1250, 1400, 1500, "max"] },
    levels: { click: 1, multiplier: 1, clickDelay: 1 }
}
// variáveis de controle para fazer os upgrades
let money = 0;
// variáveis de controle para fazer os upgrades do auto clicker
const autoClick = {
    button: document.querySelector("#auto-click"),
    clickPower: 1,
    click: 1,
    multiplier: 100,
    clickDelay: 2000,
    buttons: { click: document.querySelector("#auto-click-power"), multiplier: document.querySelector("#auto-click-mult"), clickDelay: document.querySelector("#auto-click-delay") },
    prices: { autoClick: 600, click: [20, 50, 70, 100, 130, 170, 250, 400, 580, "max"], multiplier: [30, 75, 105, 150, 195, 255, 375, 600, 870, "max"], clickDelay: [50, 100, 150, 300, 400, 500, 600, 750, 900, "max"] },
    levels: { click: 1, multiplier: 1, clickDelay: 1 },
    comprado: false
};
//  id do intervalo atual do auto clicker
let IntervalAtualId = 0;
//  botões de melhoria bloqueados do auto clicker
const buttonsBloqueados = document.querySelectorAll(".disabled");

// variáveis do menu "stats"
let moneyGanhoTotal = 0;
let moneyGastoTotal = 0;
// checkboxes do menus "stats"
const checkboxPocaoOuro = document.querySelector("#toggle-pocao-ouro");
const checkboxPocaoDelay = document.querySelector("#toggle-pocao-delay");
const checkboxAutoClick = document.querySelector("#toggle-auto-click");

// poções de buff permanente do menu "loja"
const pocaoOuroPerm = document.querySelector("#pocao-ouro-permanente-comprar");
const pocaoDelayPerm = document.querySelector("#pocao-delay-permanente-comprar");

// 
// elementos e sub-elementos do container dos buffs
// 
const buffsContainer = document.querySelector("#buffs");
const buffs = document.querySelector("#buffs-list");
// elementos de buffs
const buffMoney1 = document.querySelectorAll(".pocao-ouro button")[0];
const buffMoney2 = document.querySelectorAll(".pocao-ouro button")[1];
const buffMoney3 = document.querySelectorAll(".pocao-ouro button")[2];
const buffDelay1 = document.querySelectorAll(".pocao-delay button")[0];
const buffDelay2 = document.querySelectorAll(".pocao-delay button")[1];
const buffDelay3 = document.querySelectorAll(".pocao-delay button")[2];
// variáveis de tempo para os buffs
let buffMoneyTempo1 = 0;
let buffMoneyTempo2 = 0;
let buffDelayTempo1 = 0;
let buffDelayTempo2 = 0;
// multiplicadores de delay e dinheiro. Podem ter seus valores alterados pelos buffs
let delayMultiplier = 100;
let bonusMultiplier = 100;
// 
// sons
// 
const somMoneyIncrease = new Audio("sons/dinheiro.mp3");

function appendBuyBuffFunctionality(element, buffName, buffType, multiplierVariable, multiplier, counter) {
    element.addEventListener('click', function () {
        if (money >= parseInt(element.textContent)) {
            money -= parseInt(this.textContent);
            moneyGastoTotal += parseInt(this.textContent);
            updateMoneyDisplayer();
            updateStats();
            const time = parseInt(this.parentElement.children[0].children[1].textContent.substring(0, 2)) * 60;
            if (eval(counter) === 0) {
                createBuff(buffName, multiplierVariable, multiplier, counter, time);
            } else {
                updateBuff(buffType, time);
            }
        } else {
            alert(`Dinheiro insuficiente. Necessário: ${this.textContent}. Atual: ${money}`);
        }
    })
}
for (let i = 0; i < document.querySelectorAll(".pocao-ouro button").length; i++) {
    if (i < 2) {
        appendBuyBuffFunctionality(document.querySelectorAll(".pocao-ouro button")[i], "dinheiro", "money1", "bonusMultiplier", 2, "buffMoneyTempo1");
        appendBuyBuffFunctionality(document.querySelectorAll(".pocao-delay button")[i], "delay", "delay1", "delayMultiplier", 2, "buffDelayTempo1");
    } else {
        appendBuyBuffFunctionality(document.querySelectorAll(".pocao-ouro button")[i], "dinheiro", "money2", "bonusMultiplier", 5, "buffMoneyTempo2");
        appendBuyBuffFunctionality(document.querySelectorAll(".pocao-delay button")[i], "delay", "delay2", "delayMultiplier", 4, "buffDelayTempo2");
    }
}

function createBuff(buffType, multiplierVariable, multiplier, counter, time) {
    switch (counter) {
        case "buffMoneyTempo1":
            buffMoneyTempo1 = time;
            break;
        case "buffMoneyTempo2":
            buffMoneyTempo2 = time;
            break;
        case "buffDelayTempo1":
            buffDelayTempo1 = time;
            break;
        case "buffDelayTempo2":
            buffDelayTempo2 = time;
            break;
    }
    switch (multiplierVariable) {
        case "bonusMultiplier":
            bonusMultiplier *= multiplier;
            break;
        case "delayMultiplier":
            delayMultiplier /= multiplier;
            break;
    }
    if (getComputedStyle(buffsContainer).display === "none") {
        buffsContainer.style.display = "block";
    }
    const item = document.createElement("li");
    item.textContent = `${multiplier}X ${buffType} | ${eval(counter)}s`
    buffs.appendChild(item);
    const id = setInterval(function () {
        updateStats();
        switch (counter) {
            case "buffMoneyTempo1":
                buffMoneyTempo1 -= 1;
                break;
            case "buffMoneyTempo2":
                buffMoneyTempo2 -= 1;
                break;
            case "buffDelayTempo1":
                buffDelayTempo1 -= 1;
                break;
            case "buffDelayTempo2":
                buffDelayTempo2 -= 1;
                break;
        }
        item.textContent = `${multiplier}X ${buffType} | ${eval(counter)}s`;
        if (eval(counter) === 0) {
            clearInterval(id);
            item.remove();
            switch (multiplierVariable) {
                case "bonusMultiplier":
                    bonusMultiplier /= multiplier;
                    break;
                case "delay":
                    delayMultiplier *= multiplier;
                    break;
            }
            updateStats();
        }
        if (buffs.children.length === 0) {
            buffsContainer.style.display = "none";
        }
    }, 1000)
}
function updateBuff(type, time) {
    switch (type) {
        case "money1":
            buffMoneyTempo1 += time;
            for (let i = 0; i < buffs.children.length; i++) {
                if (buffs.children[i].textContent.indexOf("2X dinheiro") > -1) {
                    buffs.children[i].textContent = `2X dinheiro | ${buffMoneyTempo1}s`;
                    break;
                }
            }
            break;
        case "money2":
            buffMoneyTempo2 += time;
            for (let i = 0; i < buffs.children.length; i++) {
                if (buffs.children[i].textContent.indexOf("5X dinheiro") > -1) {
                    buffs.children[i].textContent = `5X dinheiro | ${buffMoneyTempo2}s`;
                    break;
                }
            }
            break;
        case "delay1":
            buffDelayTempo1 += time;
            for (let i = 0; i < buffs.children.length; i++) {
                if (buffs.children[i].textContent.indexOf("0.5X delay") > -1) {
                    buffs.children[i].textContent = `0.5X delay | ${buffDelayTempo1}s`;
                    break;
                }
            }
            break;
        case "delay2":
            buffDelayTempo2 += time;
            for (let i = 0; i < buffs.children.length; i++) {
                if (buffs.children[i].textContent.indexOf("0.25X delay") > -1) {
                    buffs.children[i].textContent = `0.25X delay | ${buffDelayTempo2}s`;
                    break;
                }
            }
            break;
    }
}
for (let i = 0; i < redimensionadores.length; i++) {
    function resize(button, section) {
        button.addEventListener('click', function () {
            section.classList.toggle("max-size");
            section.classList.toggle("normal-size");
            if (button.src === "file:///media/fuse/drivefs-cd57c77a49defb3e47abc715efa5d22f/root/Projeto/clicker/imagens/maximizar.png") {
                button.src = "imagens/minimizar.png";
            } else {
                button.src = "imagens/maximizar.png";
            }
        })
    }
    switch (redimensionadores[i].id) {
        case "shop-resize":
            resize(redimensionadores[i], shopMenu);
            break;
        case "upgrades-resize":
            resize(redimensionadores[i], upgradesMenu);
            break;
        case "config-resize":
            resize(redimensionadores[i], configMenu);
            break;
        case "stats-resize":
            resize(redimensionadores[i], statsMenu);
            break;
    }
}
window.addEventListener('resize', function () {
    text.style.left = `${image.getBoundingClientRect().left}px`;
    text2.style.left = `${image.getBoundingClientRect().left + 50}px`;
    buttons1.style.height = `${shopButton.getBoundingClientRect().height + upgradesButton.getBoundingClientRect().height + 10}px`;
    buttons2.style.height = `${configButton.getBoundingClientRect().height + statsButton.getBoundingClientRect().height + 10}px`;
    updateMoneyDisplayer();
})
window.addEventListener('click', function () {
    document.querySelector("#clickes").textContent = parseInt(this.document.querySelector("#clickes").textContent) + 1;
})

image.addEventListener('click', function () {
    if (text.style.opacity === "" || text.style.opacity === "0") {
        text.textContent = `+${manual.clickPower * (bonusMultiplier / 100)}`;
        text.style.opacity = "1";
        money += manual.clickPower * (bonusMultiplier / 100);
        moneyDisplayer.textContent = money;
        updateMoneyDisplayer();
        moneyGanhoTotal += manual.clickPower * (bonusMultiplier / 100);
        updateStats();
        somMoneyIncrease.play()
        document.querySelector("#money-total").textContent = moneyGanhoTotal;
        setTimeout(function () {
            text.style.opacity = "0";
        }, (manual.clickDelay * (delayMultiplier / 100)));
        verificarMoney(manual.prices.click[manual.levels.click - 1], manual.buttons.click);
        verificarMoney(manual.prices.multiplier[manual.levels.multiplier - 1],manual.buttons. multiplier);
        verificarMoney(manual.prices.clickDelay[manual.levels.clickDelay - 1], manual.buttons.clickDelay);
    }
})
autoClick.button.addEventListener('click', function () {
    if (autoClick.comprado) {
        alert("Você já comprou o Auto Clicker");
    } else {
        if (money > 600) {
            money -= 600;
            moneyGastoTotal += 600;
            updateMoneyDisplayer();
            updateStats();
            autoClick.comprado = true;
            autoClick.button.textContent = "comprado";
            IntervalAtualId = setInterval(function () {
                text2.textContent = `+${autoClick.clickPower * (bonusMultiplier / 100)}`;
                text2.style.opacity = "1";
                money += autoClick.clickPower * (bonusMultiplier / 100);
                moneyDisplayer.textContent = money;
                updateMoneyDisplayer();
                moneyGanhoTotal += autoClick.clickPower * (bonusMultiplier / 100);
                updateStats();
                somMoneyIncrease.play();
                document.querySelector("#money-total").textContent = moneyGanhoTotal;
                setTimeout(function () {
                    text2.style.opacity = "0";
                }, (autoClick.clickDelay * (delayMultiplier / 100)) - 150)
            }, (autoClick.clickDelay * (delayMultiplier / 100)));
            for (let i = 0; i < buttonsBloqueados.length; i++) {
                buttonsBloqueados[i].classList.remove("disabled");
                verificarMoney(parseInt(buttonsBloqueados[i].textContent), buttonsBloqueados[i]);
            }
            checkboxAutoClick.checked = true;
            checkboxAutoClick.removeAttribute('disabled');
        } else {
            alert(`Dinheiro insuficiente. Necessário: 600. Atual: ${money}`);
        }
    }
})
function verificarMoney(price, button) {
    if (price === "max") {
        button.setAttribute('disabled', "true");
        button.classList.add("max");
    } else if (money >= price) {
        button.removeAttribute('disabled');
    } else {
        button.setAttribute('disabled', "true");
    }
}
function upgrade(button, prices, level, compra) {
    button.addEventListener('click', function () {
        if (prices[level - 1] !== "max") {
            money -= prices[level - 1];
            moneyDisplayer.textContent = money;
            updateMoneyDisplayer();
            moneyGastoTotal += prices[level - 1];
            level++;
            switch (compra) {
                case 'clickPower':
                    manual.click++;
                    manual.levels.click++;
                    break;
                case 'clickMult':
                    manual.multiplier += 10;
                    manual.levels.multiplier++;
                    break;
                case 'clickDelay':
                    manual.clickDelay -= 50;
                    manual.levels.clickDelay++;
                    break;
            }
            button.textContent = `${prices[level - 1]}`;
            updateClickValue();
            updateStats();
            verificarMoney(manual.prices.click[manual.levels.click - 1], manual.buttons.click);
            verificarMoney(manual.prices.multiplier[manual.levels.multiplier - 1], manual.buttons.multiplier);
            verificarMoney(manual.prices.clickDelay[manual.levels.clickDelay - 1], manual.buttons.clickDelay);
        } else {
            alert("Você chegou ao nível máximo!");
        }
    })
}
function upgradeAutoClick(button, prices, level, compra) {
    button.addEventListener('click', function () {
        if (prices[level - 1] !== "max") {
            if (money >= prices[level - 1]) {
                money -= prices[level - 1];
                moneyDisplayer.textContent = money;
                updateMoneyDisplayer();
                moneyGastoTotal += prices[level - 1];
                level++;
                switch (compra) {
                    case 'clickPower':
                        autoClick.click++;
                        autoClick.levels.click++;
                        break;
                    case 'multiplier':
                        autoClick.multiplier += 10;
                        autoClick.levels.multiplier++;
                        break;
                    case 'clickDelay':
                        autoClick.clickDelay -= 50;
                        autoClick.levels.clickDelay++;
                        updateAutoClick(IntervalAtualId)
                        break;
                }
                button.textContent = `${prices[level - 1]}`;
                updateAutoClickValue();
                updateStats();
                verificarMoney(autoClick.prices.click[autoClick.levels.click - 1], autoClick.buttons.click);
                verificarMoney(autoClick.prices.multiplier[autoClick.levels.multiplier - 1], autoClick.buttons.multiplier);
                verificarMoney(autoClick.prices.clickDelay[autoClick.levels.clickDelay - 1], autoClick.buttons.clickDelay);
            }
        } else {
            alert("Você chegou ao nível máximo!");
        }
    })
}
function updateClickValue() {
    multiplier = manual.multiplier / 100;
    manual.clickPower = manual.click * multiplier;
}
function updateAutoClickValue() {
    multiplier = autoClick.multiplier / 100;
    autoClick.clickPower = autoClick.click * multiplier;
}
function updateAutoClick(id) {
    clearInterval(id);
    IntervalAtualId = setInterval(function () {
        text2.textContent = `+${autoClick.clickPower * (bonusMultiplier / 100)}`;
        text2.style.opacity = "1";
        money += autoClick.clickPower * (bonusMultiplier / 100);
        moneyDisplayer.textContent = money;
        updateMoneyDisplayer();
        moneyGanhoTotal += autoClick.clickPower * (bonusMultiplier / 100);
        updateStats();
        somMoneyIncrease.play();
        setTimeout(function () {
            text2.style.opacity = "0";
        }, (autoClick.clickDelay * (delayMultiplier / 100)) - 150)
    }, (autoClick.clickDelay * (delayMultiplier / 100)));
}
checkboxAutoClick.addEventListener('click', function () {
    if (checkboxAutoClick.checked) {
        IntervalAtualId = setInterval(function () {
            text2.textContent = `+${autoClick.clickPower * (bonusMultiplier / 100)}`;
            text2.style.opacity = "1";
            money += autoClick.clickPower * (bonusMultiplier / 100);
            moneyGanhoTotal += autoClick.clickPower * (bonusMultiplier / 100);
            moneyDisplayer.textContent = money;
            updateMoneyDisplayer()
            updateStats();
            somMoneyIncrease.play();
            setTimeout(function () {
                text2.style.opacity = "0";
            }, (autoClick.clickDelay * delayMultiplier) - 150)
        }, (autoClick.clickDelay * delayMultiplier))
    } else {
        clearInterval(IntervalAtualId);
    }
})
pocaoOuroPerm.addEventListener('click', function () {
    debugger;
    if (money > parseInt(this.textContent) && !(pocaoOuroPerm.classList.contains("comprado"))) {
        bonusMultiplier *= 2;
        money -= parseInt(this.textContent);
        moneyGastoTotal += parseInt(this.textContent);
        updateMoneyDisplayer();
        updateStats();
        this.classList.add("comprado");
        this.textContent = "Comprado";
        checkboxPocaoOuro.removeAttribute('disabled');
        checkboxPocaoOuro.checked = true;
    } else if (money < parseInt(pocaoOuroPerm.textContent)) {
        alert(`Dinheiro insuficiente. Necessário: ${pocaoOuroPerm.textContent}. Atual: ${money}.`)
    } else {
        alert("Esta poção permanente já foi comprada.")
    }
})
checkboxPocaoOuro.addEventListener('click', function () {
    if (this.checked === true) {
        bonusMultiplier *= 2;
    } else {
        bonusMultiplier /= 2;
    }
})
function updateStats() {
    document.querySelector("#money-total").textContent = moneyGanhoTotal;
    document.querySelector("#money-gasto").textContent = moneyGastoTotal;
    moneyDisplayer.textContent = money;
    document.querySelector("#click-power-stats").textContent = manual.clickPower;
    document.querySelector("#click-mult-stats").textContent = `${manual.multiplier}%`;
    document.querySelector("#click-delay-stats").textContent = `${manual.clickDelay / 1000}s`;
    document.querySelector("#auto-click-power-stats").textContent = autoClick.clickPower;
    document.querySelector("#auto-click-mult-stats").textContent = `${autoClick.multiplier}%`;
    document.querySelector("#auto-click-delay-stats").textContent = `${autoClick.clickDelay / 1000}s`;
    document.querySelector("#click-multiplier-bonus-stats").textContent = `${bonusMultiplier}%`;
    document.querySelector("#delay-multiplier-stats").textContent = `${delayMultiplier}%`;
}
function updateMoneyDisplayer() {
    moneyDisplayer.textContent = money;
    const fixedPosition = `${(window.innerWidth - parseInt(getComputedStyle(moneyDisplayer).width.substring(0, getComputedStyle(moneyDisplayer).width.length - 2))) / 2}px`;
    moneyDisplayer.style.left = fixedPosition;
    moneyDisplayer.style.top = `${image.getBoundingClientRect().y + 85}px`;
}
function run() {
    buttons1.style.height = `${shopButton.getBoundingClientRect().height + upgradesButton.getBoundingClientRect().height + 10}px`;
    buttons2.style.height = `${configButton.getBoundingClientRect().height + statsButton.getBoundingClientRect().height + 10}px`;
    text.style.left = `${image.getBoundingClientRect().left}px`;
    text2.style.left = `${image.getBoundingClientRect().left + 50}px`;
    updateMoneyDisplayer();
    manual.buttons.click.textContent = `${manual.prices.click[0]}`;
    manual.buttons.multiplier.textContent = `${manual.prices.multiplier[0]}`;
    manual.buttons.clickDelay.textContent = `${manual.prices.clickDelay[0]}`;
    autoClick.buttons.click.textContent = `${autoClick.prices.click[0]}`;
    autoClick.buttons.multiplier.textContent = `${autoClick.prices.multiplier[0]}`;
    autoClick.buttons.clickDelay.textContent = `${autoClick.prices.clickDelay[0]}`;
    upgrade(manual.buttons.click, manual.prices.click, manual.levels.click, 'clickPower');
    upgrade(manual.buttons.multiplier, manual.prices.multiplier, manual.levels.multiplier, 'clickMult');
    upgrade(manual.buttons.clickDelay, manual.prices.clickDelay, manual.levels.clickDelay, 'clickDelay');
    upgradeAutoClick(autoClick.buttons.click, autoClick.prices.click, autoClick.levels.click, 'clickPower');
    upgradeAutoClick(autoClick.buttons.multiplier, autoClick.prices.multiplier, autoClick.levels.multiplier, 'multiplier');
    upgradeAutoClick(autoClick.buttons.clickDelay, autoClick.prices.clickDelay, autoClick.levels.clickDelay, 'clickDelay');
    updateStats();
}
run();

pocaoDelayPerm.addEventListener('click', function () {
    alert("Isto ainda está em desenvolvimento.");
})