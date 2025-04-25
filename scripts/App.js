class App {
    fieldValues = {
        FIELD_SIZE: 20,
        MODEL: [],
        DELAY: 150
    }

    cellState = {
        EMPTY_CELL: 0,
        SNAKE_CELL: 1,
        FOOD_CELL: 2
    }

    SNAKE = [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 }
    ]

    snakeEnds = {
        head: this.SNAKE.at(0),
        tail: this.SNAKE.at(-1)
    }

    movementDirection = {
        current: 'right',
        up: 'up',
        right: 'right',
        down: 'down',
        left: 'left'
    }
    
    constructor() {
        this.createModel();
        this.putFoodToModel();
        this.displayField();
        // setInterval(this.update, this.fieldValues.DELAY);
        setTimeout(this.update.bind(this), this.fieldValues.DELAY); 
        //тут подсказала нейросеть, что this теряется при передаче. Чтобы не забыть, написал именно так, а не стрелкой
    }

    helpers = {
        getRandomCell(a, b) {
            return {
                x: Math.floor(Math.random() * (b - a + 1)) + a,
                y: Math.floor(Math.random() * (b - a + 1)) + a
            }
        }
    }

    createModel() {
        // пустая модель
        for (let y = 0; y < this.fieldValues.FIELD_SIZE; y++) {
            const row = [];
            for (let x = 0; x < this.fieldValues.FIELD_SIZE; x++) {
                row.push(this.cellState.EMPTY_CELL);
            }
            this.fieldValues.MODEL.push(row);
        }
        // Добавляем змею
        for (let i = 0; i < this.SNAKE.length; i++) {
            this.fieldValues.MODEL[this.SNAKE[i].y][this.SNAKE[i].x] = this.cellState.SNAKE_CELL;
        }
    }

    putFoodToModel() {
        // рандомная ячейка
        const cellObj = this.helpers.getRandomCell(0, this.fieldValues.FIELD_SIZE);
        // проверка на змею
        if (!this.SNAKE.some(obj => obj === cellObj)) {
            this.fieldValues.MODEL[cellObj.y][cellObj.x] = this.cellState.FOOD_CELL;
        } else {
            this.putFoodToModel();
        }
    }

    displayField() {
        const rowElement = document.getElementById('row-template');
        const cellElement = document.getElementById('cell-template');
        const rootElement = document.querySelector('.field');

        for (let y = 0; y < this.fieldValues.FIELD_SIZE; y++) {
            const row = rowElement.content.firstElementChild.cloneNode(false); // false ибо нету ничего внутри
            for (let x = 0; x < this.fieldValues.FIELD_SIZE; x++) {
                const cell = cellElement.content.firstElementChild.cloneNode(false);
                //координаты
                cell.dataset.x = x;
                cell.dataset.y = y;
                //классы для особенных ячеек
                if (this.fieldValues.MODEL[y][x] === this.cellState.FOOD_CELL) {
                    cell.classList.add('food');
                }
                if (this.fieldValues.MODEL[y][x] === this.cellState.SNAKE_CELL) {
                    cell.classList.add('snake-body');
                }
                row.append(cell);
            }
            rootElement.append(row);
        }
    }

    update() {
        let isFood = false; // для обновления DOM

        // координаты концов змеи
        const 
        snakeNextX = this.snakeEnds.head.x + 1,
        snakeNextY = this.snakeEnds.head.y + 1,
        snakeHeadX = this.snakeEnds.head.x, 
        snakeHeadY = this.snakeEnds.head.y,
        snakeTailX = this.snakeEnds.tail.x,
        snakeTailY = this.snakeEnds.tail.y;

        // DOM-элемент хвоста
        const tailElement = document.querySelector(`[data-x="${snakeTailX}"][data-y="${snakeTailY}"]`);
        let nextElement;

        console.log(this.movementDirection.current);
        // двигаем змею
        switch (this.movementDirection.current) {
            case 'right':
                // DOM-элемент следующей клетки
                nextElement = document.querySelector(`[data-x="${snakeNextX}"][data-y="${snakeHeadY}"]`);
                console.log(nextElement);

                // проверяю следующую клетку на пустоту
                if (this.fieldValues.MODEL[snakeHeadY][snakeNextX] === this.cellState.EMPTY_CELL) {
                     // если пустота, ставим змею
                     this.fieldValues.MODEL[snakeHeadY][snakeNextX] = this.cellState.SNAKE_CELL;
                     // хвост убираем
                     this.fieldValues.MODEL[snakeTailY][snakeTailX] = this.cellState.EMPTY_CELL;
                     console.log('сработало');
                } else if (0) { // проверяю на еду
                    // если еда, ставим змею, НО не убираем хвост
                    this.fieldValues.MODEL[snakeHeadY][snakeNextX] = this.cellState.SNAKE_CELL;
                    isFood = true;
                } else {
                    // если змея
                    this.looseActions();
                }
            case 'down':
            case 'left':
            case 'up':
        }

        // обновление экрана
        nextElement.classList.toggle('snake-body', true);
        nextElement.classList.toggle('food', false);
        if (!isFood) {
            tailElement.classList.toggle('snake-body', false);
        }
        console.log(nextElement);
    }

    looseActions() {}
}

export default App;