class App {
  fieldValues = {
    FIELD_SIZE: 10,
    MODEL: [],
    DELAY: 150,
    IS_ACTIVE: true
  };

  cellState = {
    EMPTY_CELL: 0,
    SNAKE_CELL: 1,
    FOOD_CELL: 2,
  };

  SNAKE = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];

  snakeEnds = {
    head: this.SNAKE.at(0),
    tail: this.SNAKE.at(-1),
  };

  movementDirection = {
    current: "right",
    up: "up",
    right: "right",
    down: "down",
    left: "left",
  };

  initialValues = {
    fieldValues: structuredClone(this.fieldValues),
    SNAKE: structuredClone(this.SNAKE),
    snakeEnds: structuredClone(this.snakeEnds),
    movementDirection: structuredClone(this.movementDirection)
  }

  helpers = {
    getRandomCell(a, b) {
      return {
        x: Math.floor(Math.random() * (b - a + 1)) + a,
        y: Math.floor(Math.random() * (b - a + 1)) + a,
      };
    },
  };

  constructor() {
    this.createModel();
    this.putFoodToModel();
    this.displayField();

    this.controlsListener();
    setInterval(this.update.bind(this), this.fieldValues.DELAY);
    //тут подсказала нейросеть, что this теряется при передаче. Чтобы не забыть, написал именно так, а не стрелкой

    this.restartListener();
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
      this.fieldValues.MODEL[this.SNAKE[i].y][this.SNAKE[i].x] =
        this.cellState.SNAKE_CELL;
    }
  }

  putFoodToModel() {
    // рандомная ячейка
    const randomCell = this.helpers.getRandomCell(0,this.fieldValues.FIELD_SIZE - 1);
    // проверка на змею. Возможно нужно генерить изначально вокруг змеи, ибо под конец неизвестно сколько будет тыкать в змею
    if (!this.SNAKE.some((obj) => {
        if (obj.x === randomCell.x && obj.y === randomCell.y) return true;
        return false;
      })) {
        this.fieldValues.MODEL[randomCell.y][randomCell.x] = this.cellState.FOOD_CELL;
        return randomCell;
      } else {
      console.log('по-новой');
      return this.putFoodToModel();
    }
  }

  displayField() {
    // удаление предыдущей разметки для перерисовки (думаю по-хорошему менять локально, но это потом)
    this.updateHTML();

    const rowElement = document.getElementById("row-template");
    const cellElement = document.getElementById("cell-template");
    const rootElement = document.querySelector(".field");

    for (let y = 0; y < this.fieldValues.FIELD_SIZE; y++) {
      const row = rowElement.content.firstElementChild.cloneNode(false); // false ибо нету ничего внутри. Возможно это неправильно, но я так написал, чтобы запомнить, зачем там true/false
      for (let x = 0; x < this.fieldValues.FIELD_SIZE; x++) {
        const cell = cellElement.content.firstElementChild.cloneNode(false);
        //координаты
        cell.dataset.x = x;
        cell.dataset.y = y;
        //классы для особенных ячеек
        if (this.fieldValues.MODEL[y][x] === this.cellState.FOOD_CELL) {
          cell.classList.add("food");
        }
        if (this.fieldValues.MODEL[y][x] === this.cellState.SNAKE_CELL) {
          cell.classList.add("snake-body");
        }
        row.append(cell);
      }
      rootElement.append(row);
    }
  }

  updateHTML() {
    const fieldElement = document.querySelector('.field');
    fieldElement.remove();

    const newField = document.createElement('div');
    newField.classList.add('field', 'shadow');

    const bodyElement = document.querySelector('body');
    bodyElement.append(newField);
  }

  updateEnds() {
    this.snakeEnds.head = this.SNAKE.at(0);
    this.snakeEnds.tail = this.SNAKE.at(-1);
  }

  updateModel(nextCell, isFood) {
    this.fieldValues.MODEL[nextCell.y][nextCell.x] = this.cellState.SNAKE_CELL;
    if (!isFood) {
      this.fieldValues.MODEL[this.snakeEnds.tail.y][this.snakeEnds.tail.x] =
        this.cellState.EMPTY_CELL; 
        
    }
  }

  update() {
    // lock при неактивной игре (проигрыш)
    if (!this.fieldValues.IS_ACTIVE) return -1;

    console.log("Текущая змея:", structuredClone(this.SNAKE));
    console.log("Текущее поле:", structuredClone(this.fieldValues.MODEL));
    console.log("Текущее концы:", structuredClone(this.snakeEnds));

    let isSteppedOnFood = false; // для обновления DOM

    // координаты концов змеи
    const snakeHeadX = this.snakeEnds.head.x,
      snakeHeadY = this.snakeEnds.head.y,
      snakeTailX = this.snakeEnds.tail.x,
      snakeTailY = this.snakeEnds.tail.y;

    // DOM-элемент хвоста
    const tailElement = document.querySelector(
      `[data-x="${snakeTailX}"][data-y="${snakeTailY}"]`
    );

    // определяем next элемент
    let snakeNextX, snakeNextY;
    switch (this.movementDirection.current) {
      case "right":
        (snakeNextX = this.snakeEnds.head.x + 1), (snakeNextY = snakeHeadY);
        break;
      case "down":
        (snakeNextX = snakeHeadX), (snakeNextY = this.snakeEnds.head.y + 1);
        break;
      case "left":
        (snakeNextX = this.snakeEnds.head.x - 1), (snakeNextY = snakeHeadY);
        break;
      case "up":
        (snakeNextX = snakeHeadX), (snakeNextY = this.snakeEnds.head.y - 1);
        break;
    }

    const nextObj = {
      x: snakeNextX,
      y: snakeNextY,
    };

    // DOM-элемент следующей клетки
    const nextElement = document.querySelector(
      `[data-x="${snakeNextX}"][data-y="${snakeNextY}"]`
    );

    //добавляю голову змее
    this.SNAKE.unshift({
      x: snakeNextX,
      y: snakeNextY,
    });
    // проверяю следующую клетку на пустоту
    if (
      this.fieldValues.MODEL[snakeNextY][snakeNextX] ===
      this.cellState.EMPTY_CELL
    ) {
      // обновляю модель змеи
      this.SNAKE.pop(); // убираю хвост
    } else if (       // проверяю на еду
      this.fieldValues.MODEL[snakeNextY][snakeNextX] ===
      this.cellState.FOOD_CELL
    ) {
      // если еда, ставим змею, НО не убираем хвост
      isSteppedOnFood = true;
    } else {  // если змея или край карты
        console.log(this.SNAKE, this.fieldValues.MODEL);
      this.looseActions();
      this.fieldValues.IS_ACTIVE = false;
      return -1;
    }
    //
    this.updateModel(nextObj, isSteppedOnFood);
    this.updateEnds();
    // обновление экрана
    nextElement.classList.toggle("snake-body", true);
    nextElement.classList.toggle("food", false);
    if (!isSteppedOnFood) {
      tailElement.classList.toggle("snake-body", false);
    } else {
      const newFood = this.putFoodToModel(),
        newFoodElement = document.querySelector(
          `[data-x="${newFood.x}"][data-y="${newFood.y}"]`
        );
      newFoodElement.classList.toggle("food", true);
    }
    // console.log(nextElement);
  }

  controlsListener() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowRight":
          if (this.movementDirection.current !== this.movementDirection.left) {
            this.movementDirection.current = this.movementDirection.right;
          } else this.keyError();
          break;
        case "ArrowDown":
          if (this.movementDirection.current !== this.movementDirection.up) {
            this.movementDirection.current = this.movementDirection.down;
          } else this.keyError();
          break;
        case "ArrowLeft":
          if (this.movementDirection.current !== this.movementDirection.right) {
            this.movementDirection.current = this.movementDirection.left;
          } else this.keyError();
          break;
        case "ArrowUp":
          if (this.movementDirection.current !== this.movementDirection.down) {
            this.movementDirection.current = this.movementDirection.up;
          } else this.keyError();
          break;
      }
    });
  }

  restartListener() {
    const buttonElement = document.querySelector('.button');
    const looseElement = document.querySelector('.loose');
    const winElement = document.querySelector('.win');
    buttonElement.addEventListener('click', () => {
        looseElement.classList.toggle('visually-hidden', true);
        winElement.classList.toggle('visually-hidden', true);
        buttonElement.classList.toggle('visually-hidden', true);

        this.fieldValues= structuredClone(this.initialValues.fieldValues);
        this.SNAKE= structuredClone(this.initialValues.SNAKE);
        this.snakeEnds= structuredClone(this.initialValues.snakeEnds);
        this.movementDirection= structuredClone(this.initialValues.movementDirection);

        this.createModel();
        this.putFoodToModel();
        this.displayField();

        // this.displayField();

        // this.controlsListener();
        // setInterval(this.update.bind(this), this.fieldValues.DELAY);

        // this.restartListener();
    })
  }

  keyError() {}

  looseActions() {
    const looseElement = document.querySelector('.loose');
    const buttonElement = document.querySelector('.button');
    looseElement.classList.toggle('visually-hidden', false);
    buttonElement.classList.toggle('visually-hidden', false);
  }

  winActions() {
    const winElement = document.querySelector('.win');
    const buttonElement = document.querySelector('.button');
    winElement.classList.toggle('visually-hidden', false);
    buttonElement.classList.toggle('visually-hidden', false);
  }
}

export default App;