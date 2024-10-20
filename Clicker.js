// Closure
(function () {
    print = console.log;
    console.log = function (...data) {
        print(...data);
        const logs = document.querySelector("#logs > .content");
        const log = document.createElement("p");
        log.innerHTML = data;
        log.style.margin = "2px 0 2px 0";
        log.style.padding = "0";
        logs.appendChild(log);
    }
})();
// Closure
(function () {
    const round = Math.round;
    // Fragmento de código removido do MDN que foi adaptado.
    /**
     * Ajuste decimal de um número.
     *
     * @param  {Number}  value  O número a arredondar.
     * @param  {Integer}  exp    O expoente (o logaritmo decimal da base pretendida).
     * @returns  {Number}      O valor depois de ajustado.
     */
    function decimalAdjust(value, exp) {
        if (typeof exp === "undefined" || +exp === 0) {
            return round(value);
        }
        value = +value;
        exp = +exp;
        if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
            return NaN;
        }
        value = value.toString().split("e");
        value = round(+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
        value = value.toString().split("e");
        return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
    }
    Math.round = function (value, exp) {
        return decimalAdjust(value, exp);
    };
})();

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
const shopMenuButton = document.querySelector(".shop-button");
const upgradesMenuButton = document.querySelector(".upgrades-button");
const configMenuButton = document.querySelector(".config-button");
const statsMenuButton = document.querySelector(".stats-button");
const buttons = [shopMenuButton, upgradesMenuButton, configMenuButton, statsMenuButton];

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
const upgradeButtons = document.querySelectorAll("[data-botao-upgrade]");
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
let clickAmount = 0;
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
            money = Math.round(money - parseInt(this.textContent), -1);
            moneyGastoTotal = Math.round(moneyGastoTotal + parseInt(this.textContent), -1);
            updateMoneyDisplayer();
            updateStats();
            for (let i = 0; i < upgradeButtons.length; i++) {
                if (upgradeButtons[i].textContent === "max") {
                    verificarMoney("max", upgradeButtons[i]);
                } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                    verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
                }
            }
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
    }, 1000);
    console.log(`Foi comprado um buff de ${buffType} com um multiplicador de ${multiplier} que durará ${time} segundos.`);
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
    function resize(button, menu) {
        button.addEventListener('click', function () {
            menu.classList.toggle("max-size");
            menu.classList.toggle("normal-size");
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
        case "logs-resize":
            resize(redimensionadores[i], document.querySelector("#logs"));
    }
}
window.addEventListener('resize', function () {
    text.style.left = `${image.getBoundingClientRect().left}px`;
    text2.style.left = `${image.getBoundingClientRect().left + 50}px`;
    buttons1.style.height = `${shopMenuButton.getBoundingClientRect().height + upgradesMenuButton.getBoundingClientRect().height + 10}px`;
    buttons2.style.height = `${configMenuButton.getBoundingClientRect().height + statsMenuButton.getBoundingClientRect().height + 10}px`;
    updateMoneyDisplayer();
})
window.addEventListener('click', function () {
    clickAmount += 1;
    document.querySelector("#clickes").textContent = clickAmount;
})
window.onload = function () {
    if (localStorage.length > 0) {
        loadSave();
        console.log("O save foi carregado!");
    }
}

image.addEventListener('click', function () {
    if (text.style.opacity === "" || text.style.opacity === "0") {
        text.textContent = `+${Math.round(manual.clickPower * (bonusMultiplier / 100), -1)}`;
        text.style.opacity = "1";
        money = Math.round(money + (manual.clickPower * (bonusMultiplier / 100)), -1);
        updateMoneyDisplayer();
        moneyGanhoTotal = Math.round(moneyGanhoTotal + (manual.clickPower * (bonusMultiplier / 100)), -1);
        updateStats();
        somMoneyIncrease.play()
        setTimeout(function () {
            text.style.opacity = "0";
        }, (manual.clickDelay * (delayMultiplier / 100)));
        for (let i = 0; i < upgradeButtons.length; i++) {
            if (upgradeButtons[i].textContent === "max") {
                verificarMoney("max", upgradeButtons[i]);
            } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
            }
        }
    }
})
autoClick.button.addEventListener('click', function () {
    if (autoClick.comprado) {
        alert("Você já comprou o Auto Clicker");
    } else {
        if (money >= 600) {
            console.log("O auto clicker foi comprado.");
            money = Math.round((money - 600), -1);
            moneyGastoTotal += Math.round((moneyGastoTotal + 600), -1);
            updateMoneyDisplayer();
            updateStats();
            autoClick.comprado = true;
            this.textContent = "comprado";
            this.classList.add("max");
            IntervalAtualId = setInterval(function () {
                text2.textContent = `+${Math.round((autoClick.clickPower * (bonusMultiplier / 100)), -1)}`;
                text2.style.opacity = "1";
                money = Math.round(money + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
                updateMoneyDisplayer();
                moneyGanhoTotal = Math.round(moneyGanhoTotal + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
                updateStats();
                somMoneyIncrease.play();
                setTimeout(function () {
                    text2.style.opacity = "0";
                }, (autoClick.clickDelay * (delayMultiplier / 100)) - 150)
            }, (autoClick.clickDelay * (delayMultiplier / 100)));
            for (let i = 0; i < buttonsBloqueados.length; i++) {
                buttonsBloqueados[i].classList.remove("disabled");
                verificarMoney(parseInt(buttonsBloqueados[i].textContent), buttonsBloqueados[i]);
                /* Devido a ordem dos botões no documento HTML os 3 primeiros botões são os
                   de upgrade do click manual, então, vou aproveitar e já fazer uma checagem
                   de preço aqui mesmo. Melhor do que fazer outro loop.*/
                if (upgradeButtons[i].textContent === "max") {
                    verificarMoney("max", upgradeButtons[i]);
                } else {
                    verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
                }
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
            money = Math.round((money - prices[level - 1]), -1);
            updateMoneyDisplayer();
            moneyGastoTotal = Math.round((moneyGastoTotal + prices[level - 1]), -1);
            switch (compra) {
                case 'clickPower':
                    console.log(`O valor do clique (manual) aumentou: ${manual.click} -> ${manual.click + 1}.`);
                    manual.click++;
                    manual.levels.click++;
                    level = manual.levels.click;
                    break;
                case 'clickMult':
                    console.log(`O multiplicador do clique (manual) aumentou: ${manual.multiplier / 100}X -> ${(manual.multiplier + 20) / 100}X.`);
                    manual.multiplier += 20;
                    manual.levels.multiplier++;
                    level = manual.levels.multiplier;
                    break;
                case 'clickDelay':
                    console.log(`O delay do clique (manual) diminuiu: ${manual.clickDelay / 1000}s -> ${(manual.clickDelay - 50) / 1000}s.`);
                    manual.clickDelay -= 50;
                    manual.levels.clickDelay++;
                    level = manual.levels.clickDelay;
                    break;
            }
            button.textContent = `${prices[level - 1]}`;
            updateClickValue();
            updateStats();
            for (let i = 0; i < upgradeButtons.length; i++) {
                if (upgradeButtons[i].textContent === "max") {
                    verificarMoney("max", upgradeButtons[i]);
                } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                    verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
                }
            }
        } else {
            alert("Você chegou ao nível máximo!");
        }
    })
}
function upgradeAutoClick(button, prices, level, compra) {
    button.addEventListener('click', function () {
        if (prices[level - 1] !== "max") {
            money = Math.round((money - prices[level - 1]), -1);
            updateMoneyDisplayer();
            moneyGastoTotal = Math.round((moneyGastoTotal + prices[level - 1]), -1);
            switch (compra) {
                case 'clickPower':
                    console.log(`O valor do clique (auto click) aumentou: ${autoClick.click} -> ${autoClick.click + 1}`);
                    autoClick.click++;
                    autoClick.levels.click++;
                    level = autoClick.levels.click;
                    break;
                case 'multiplier':
                    console.log(`O multiplicador do clique (auto click) aumentou: ${autoClick.multiplier / 100}X -> ${(autoClick.multiplier + 20) / 100}X.`);
                    autoClick.multiplier += 10;
                    autoClick.levels.multiplier++;
                    level = autoClick.levels.multiplier;
                    break;
                case 'clickDelay':
                    console.log(`O delay do clique (auto click) diminuiu: ${autoClick.clickDelay / 1000}s -> ${(autoClick.clickDelay - 50) / 1000}s.`);
                    autoClick.clickDelay -= 50;
                    autoClick.levels.clickDelay++;
                    level = autoClick.levels.clickDelay;
                    updateAutoClick(IntervalAtualId)
                    break;
            }
            button.textContent = `${prices[level - 1]}`;
            updateAutoClickValue();
            updateStats();
            for (let i = 0; i < upgradeButtons.length; i++) {
                if (upgradeButtons[i].textContent === "max") {
                    verificarMoney("max", upgradeButtons[i]);
                } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                    verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
                }
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
        money = Math.round(money + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
        updateMoneyDisplayer();
        moneyGanhoTotal = Math.round(moneyGanhoTotal + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
        updateStats();
        somMoneyIncrease.play();
        setTimeout(function () {
            text2.style.opacity = "0";
        }, (autoClick.clickDelay * (delayMultiplier / 100)) - 150)
        for (let i = 0; i < upgradeButtons.length; i++) {
            if (upgradeButtons[i].textContent === "max") {
                verificarMoney("max", upgradeButtons[i]);
            } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
            }
        }
    }, (autoClick.clickDelay * (delayMultiplier / 100)));
}
checkboxAutoClick.addEventListener('click', function () {
    if (checkboxAutoClick.checked) {
        console.log("Auto clicker foi ligado.");
        IntervalAtualId = setInterval(function () {
            text2.textContent = `+${autoClick.clickPower * (bonusMultiplier / 100)}`;
            text2.style.opacity = "1";
            money = Math.round(money + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
            moneyGanhoTotal = Math.round(moneyGanhoTotal + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
            updateMoneyDisplayer()
            updateStats();
            somMoneyIncrease.play();
            setTimeout(function () {
                text2.style.opacity = "0";
            }, (autoClick.clickDelay * delayMultiplier) - 150);
            for (let i = 0; i < upgradeButtons.length; i++) {
                if (upgradeButtons[i].textContent === "max") {
                    verificarMoney("max", upgradeButtons[i]);
                } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                    verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
                }
            }
        }, (autoClick.clickDelay * (delayMultiplier / 100)))
    } else {
        console.log("Auto clicker foi desligado.");
        clearInterval(IntervalAtualId);
    }
})
pocaoOuroPerm.addEventListener('click', function () {
    if (money > parseInt(this.textContent) && !(pocaoOuroPerm.getAttribute("data-foi-comprado"))) {
        console.log("Poção de ouro permanente foi comprada.");
        bonusMultiplier *= 2;
        money = Math.round((money - parseInt(this.textContent)), -1);
        moneyGastoTotal = Math.round((moneyGastoTotal + parseInt(this.textContent)), -1);
        updateMoneyDisplayer();
        updateStats();
        this.setAttribute("data-foi-comprado", 'true');
        this.textContent = "comprado";
        checkboxPocaoOuro.removeAttribute('disabled');
        checkboxPocaoOuro.checked = true;
        for (let i = 0; i < upgradeButtons.length; i++) {
            if (upgradeButtons[i].textContent === "max") {
                verificarMoney("max", upgradeButtons[i]);
            } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
            }
        }
    } else if (money < parseInt(pocaoOuroPerm.textContent)) {
        alert(`Dinheiro insuficiente. Necessário: ${pocaoOuroPerm.textContent}. Atual: ${money}.`)
    } else {
        alert("Esta poção permanente já foi comprada.")
    }
})
pocaoDelayPerm.addEventListener('click', function () {
    if (money > parseInt(this.textContent) && !(pocaoDelayPerm.getAttribute("data-foi-comprado") === true)) {
        console.log("poção de delay permanente foi comprada.");
        delayMultiplier /= 2;
        money = Math.round((money - parseInt(this.textContent)), -1);
        moneyGastoTotal = Math.round((moneyGastoTotal + parseInt(this.textContent)), -1);
        updateMoneyDisplayer();
        updateStats();
        this.setAttribute("data-foi-comprado", "true");
        this.textContent = "comprado";
        checkboxPocaoDelay.removeAttribute("disabled");
        checkboxPocaoDelay.checked = true;
        for (let i = 0; i < upgradeButtons.length; i++) {
            if (upgradeButtons[i].textContent === "max") {
                verificarMoney("max", upgradeButtons[i]);
            } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
                verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
            }
        }
    } else if (money < parseInt(this.textContent)) {
        alert(`Dinheiro insuficiente. Necessário: ${this.textContent}. Atual: ${money}`);
    } else {
        alert("Esta poção permanente já foi comprada.");
    }
})
checkboxPocaoOuro.addEventListener('click', function () {
    if (this.checked === true) {
        bonusMultiplier *= 2;
    } else {
        bonusMultiplier /= 2;
    }
})
checkboxPocaoDelay.addEventListener('click', function () {
    if (this.checked === true) {
        delayMultiplier *= 2;
    } else {
        delayMultiplier /= 2;
    }
})
function updateStats() {
    document.querySelector("#money-total").textContent = moneyGanhoTotal;
    document.querySelector("#money-gasto").textContent = moneyGastoTotal;
    document.querySelector("#click-power-stats").textContent = manual.clickPower;
    document.querySelector("#click-mult-stats").textContent = `${manual.multiplier}%`;
    document.querySelector("#click-delay-stats").textContent = `${manual.clickDelay / 1000}s`;
    document.querySelector("#click-power-level-stats").textContent = manual.levels.click;
    document.querySelector("#click-mult-level-stats").textContent = manual.levels.multiplier;
    document.querySelector("#click-delay-level-stats").textContent = manual.levels.clickDelay;
    document.querySelector("#auto-click-power-stats").textContent = autoClick.clickPower;
    document.querySelector("#auto-click-mult-stats").textContent = `${autoClick.multiplier}%`;
    document.querySelector("#auto-click-delay-stats").textContent = `${autoClick.clickDelay / 1000}s`;
    document.querySelector("#auto-click-power-level-stats").textContent = autoClick.levels.click;
    document.querySelector("#auto-click-mult-level-stats").textContent = autoClick.levels.multiplier;
    document.querySelector("#auto-click-delay-level-stats").textContent = autoClick.levels.clickDelay;
    document.querySelector("#click-multiplier-bonus-stats").textContent = `${bonusMultiplier}%`;
    document.querySelector("#delay-multiplier-stats").textContent = `${delayMultiplier}%`;
}
function updateMoneyDisplayer() {
    moneyDisplayer.textContent = money;
    const fixedPosition = `${(window.innerWidth - parseInt(getComputedStyle(moneyDisplayer).width.substring(0, getComputedStyle(moneyDisplayer).width.length - 2))) / 2}px`;
    moneyDisplayer.style.left = fixedPosition;
    moneyDisplayer.style.top = `${image.getBoundingClientRect().y + 85}px`;
}
document.querySelector("#save-game").addEventListener('click', function(){
    try {
        save();
        console.log("O jogo foi salvo.");
    } catch (e) {
        console.log("Erro durante o salvamento:", e);
    }
})
function save() {
    // menu upgrades
    localStorage.setItem("money", money)
    localStorage.setItem("click", manual.click);
    localStorage.setItem("clickPower", manual.clickPower);
    localStorage.setItem("multiplier", manual.multiplier);
    localStorage.setItem("clickDelay", manual.clickDelay);
    localStorage.setItem("clickLevel", manual.levels.click);
    localStorage.setItem("multiplierLevel", manual.levels.multiplier);
    localStorage.setItem("clickDelayLevel", manual.levels.clickDelay);
    localStorage.setItem("autoclick.click", autoClick.click);
    localStorage.setItem("autoclick.multiplier", autoClick.multiplier);
    localStorage.setItem("autoclick.clickDelay", autoClick.clickDelay);
    localStorage.setItem("autoclick.clickLevel", autoClick.levels.click);
    localStorage.setItem("autoclick.multiplierLevel", autoClick.levels.multiplier);
    localStorage.setItem("autoclick.clickDelayLevel", autoClick.levels.clickDelay);
    localStorage.setItem("autoclick.comprado", autoClick.comprado);

    // menu loja
    localStorage.setItem("buffDelayTempo1", buffDelayTempo1);
    localStorage.setItem("buffDelayTempo2", buffDelayTempo2);
    localStorage.setItem("buffMoneyTempo1", buffMoneyTempo1);
    localStorage.setItem("buffMoneyTempo2", buffMoneyTempo2);
    localStorage.setItem("pocaoOuroPermComprada", pocaoOuroPerm.getAttribute("data-foi-comprado") !== null);
    localStorage.setItem("pocaoDelayPermComprada", pocaoDelayPerm.getAttribute("data-foi-comprado") !== null);

    // menu status
    localStorage.setItem("delayMultiplier", delayMultiplier);
    localStorage.setItem("bonusMultiplier", bonusMultiplier);
    localStorage.setItem("moneyGanhoTotal", moneyGanhoTotal);
    localStorage.setItem("moneyGastoTotal", moneyGastoTotal);
    localStorage.setItem("clickAmount", clickAmount);

    // menu config
    localStorage.setItem("autoclickCheckbox.checked", checkboxAutoClick.checked);
    localStorage.setItem("pocaoOuroCheckbox.checked", checkboxPocaoOuro.checked);
    localStorage.setItem("pocaoDelayCheckbox.checked", checkboxPocaoDelay.checked);
}
function loadSave() {
    // menu upgrades
    money = Math.round(localStorage.getItem("money"), -1);
    updateMoneyDisplayer();

    manual.click = parseInt(localStorage.getItem("click"));
    manual.clickPower = parseInt(localStorage.getItem("clickPower"));
    manual.multiplier = parseInt(localStorage.getItem("multiplier"));
    manual.clickDelay = parseInt(localStorage.getItem("clickDelay"));

    manual.levels.click = parseInt(localStorage.getItem("clickLevel"));
    manual.buttons.click.textContent = manual.prices.click[manual.levels.click - 1];

    manual.levels.multiplier = parseInt(localStorage.getItem("multiplierLevel"));
    manual.buttons.multiplier.textContent = manual.prices.multiplier[manual.levels.multiplier - 1];

    manual.levels.clickDelay = parseInt(localStorage.getItem("clickDelayLevel"));
    manual.buttons.clickDelay.textContent = manual.prices.clickDelay[manual.levels.clickDelay - 1];

    autoClick.click = parseInt(localStorage.getItem("autoclick.click"));
    autoClick.multiplier = parseInt(localStorage.getItem("autoclick.multiplier"));
    autoClick.clickPower = autoClick.click * (autoClick.multiplier / 100);
    autoClick.clickDelay = parseInt(localStorage.getItem("autoclick.clickDelay"));

    autoClick.levels.click = parseInt(localStorage.getItem("autoclick.clickLevel"));
    autoClick.buttons.click.textContent = autoClick.prices.click[autoClick.levels.click - 1];

    autoClick.levels.multiplier = parseInt(localStorage.getItem("autoclick.multiplierLevel"));
    autoClick.buttons.multiplier.textContent = autoClick.prices.multiplier[autoClick.levels.multiplier - 1];

    autoClick.levels.clickDelay = parseInt(localStorage.getItem("autoclick.clickDelayLevel"));
    autoClick.buttons.clickDelay.textContent = autoClick.prices.clickDelay[autoClick.levels.clickDelay - 1];

    autoClick.comprado = localStorage.getItem("autoclick.comprado") === 'true';

    for (let i = 0; i < upgradeButtons.length; i++) {
        if (upgradeButtons[i].textContent === "max") {
            verificarMoney("max", upgradeButtons[i]);
        } else if (!(upgradeButtons[i].classList.contains("disabled"))) {
            verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
        }
    }
    // menu loja
    buffDelayTempo1 = parseInt(localStorage.getItem("buffDelayTempo1"));
    buffDelayTempo2 = parseInt(localStorage.getItem("buffDelayTempo2"));
    buffMoneyTempo1 = parseInt(localStorage.getItem("buffMoneyTempo1"));
    buffMoneyTempo2 = parseInt(localStorage.getItem("buffMoneyTempo2"));
    if (buffDelayTempo1 > 0) {
        createBuff("delay", "delayMultiplier", 0.5, "buffDelayTempo1", buffDelayTempo1);
    }
    if (buffDelayTempo2 > 0) {
        createBuff("delay", "delayMultiplier", 0.25, "buffDelayTempo2", buffDelayTempo2);
    }
    if (buffMoneyTempo1 > 0) {
        createBuff("dinheiro", "bonusMultiplier", 2, "buffMoneyTempo1", buffMoneyTempo1);
    }
    if (buffMoneyTempo2 > 0) {
        createBuff("dinheiro", "bonusMultiplier", 4, "buffMoneyTempo2", buffMoneyTempo2);
    }
    if (localStorage.getItem("pocaoOuroPermComprada") === "true") {
        pocaoOuroPerm.textContent = "comprado";
        pocaoOuroPerm.setAttribute("data-foi-comprado", "true");
        bonusMultiplier *= 2;
        checkboxPocaoOuro.removeAttribute("disabled");
    }
    if (localStorage.getItem("pocaoDelayPermComprada") === "true") {
        pocaoDelayPerm.textContent = "comprado";
        pocaoDelayPerm.setAttribute("data-foi-comprado", "true");
        delayMultiplier /= 2;
        checkboxPocaoDelay.removeAttribute("disabled");
    }

    // menu config
    checkboxAutoClick.checked = localStorage.getItem("autoclickCheckbox.checked") === "true";
    checkboxPocaoOuro.checked = localStorage.getItem("pocaoOuroCheckbox.checked") === "true";
    checkboxPocaoDelay.checked = localStorage.getItem("pocaoDelayCheckbox.checked") === "true";

    // menu status
    delayMultiplier = parseInt(localStorage.getItem("delayMultiplier", delayMultiplier));
    bonusMultiplier = parseInt(localStorage.getItem("bonusMultiplier", bonusMultiplier));
    moneyGanhoTotal = parseInt(localStorage.getItem("moneyGanhoTotal", moneyGanhoTotal));
    moneyGastoTotal = parseInt(localStorage.getItem("moneyGastoTotal", moneyGastoTotal));
    clickAmount = parseInt(localStorage.getItem("clickAmount", clickAmount));
    updateStats();

    // auto clicker 
    /*o código está aqui ao invés de estar na parte do "menu upgrades"
      porque a checagem "checkboxAutoClick.checked === true" não funcionaria,
      já que a propriedade checked só teria seu valor atualizado depois.
      Eu poderia ter apenas colocado lá o código que atualiza o valor da propriedade .checked?
      Sim, mas eu quis manter a ordem dos menus. (Frescura)*/
    if (autoClick.comprado === true && checkboxAutoClick.checked) {
        autoClick.button.textContent = "Comprado";
        autoClick.button.classList.add("max");
        checkboxAutoClick.removeAttribute("disabled");
        IntervalAtualId = setInterval(function () {
            text2.textContent = `+${Math.round(autoClick.clickPower * (bonusMultiplier / 100), -1)}`;
            text2.style.opacity = "1";
            money = Math.round(money + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
            updateMoneyDisplayer();
            moneyGanhoTotal = Math.round(moneyGanhoTotal + (autoClick.clickPower * (bonusMultiplier / 100)), -1);
            updateStats();
            somMoneyIncrease.play();
            setTimeout(function () {
                text2.style.opacity = "0";
            }, (autoClick.clickDelay * (delayMultiplier / 100)) - 150);
            for (let i = 0; i < upgradeButtons.length; i++) {
                if (upgradeButtons[i].textContent === "max") {
                    verificarMoney("max", upgradeButtons[i]);
                } else {
                    verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
                }
            }
        }, autoClick.clickDelay * (delayMultiplier / 100));
        for (let i = 0; i < buttonsBloqueados.length; i++) {
            buttonsBloqueados[i].removeAttribute("disabled");
            verificarMoney(parseInt(buttonsBloqueados[i].textContent), buttonsBloqueados[i]);
            if (upgradeButtons[i].textContent === "max") {
                verificarMoney("max", upgradeButtons[i]);
            } else {
                verificarMoney(parseInt(upgradeButtons[i].textContent), upgradeButtons[i]);
            }
        }
    }
    else if (autoClick.comprado === true) {
        autoClick.button.textContent = "comprado";
        autoClick.button.classList.add("max");
        checkboxAutoClick.removeAttribute("disabled");
    }
}
function run() {
    buttons1.style.height = `${shopMenuButton.getBoundingClientRect().height + upgradesMenuButton.getBoundingClientRect().height + 10}px`;
    buttons2.style.height = `${configMenuButton.getBoundingClientRect().height + statsMenuButton.getBoundingClientRect().height + 10}px`;
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
