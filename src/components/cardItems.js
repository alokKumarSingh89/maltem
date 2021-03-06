import './addCardForm.js';

let start = 0;
let target = undefined;

const cardtemplate = document.createElement('template');

cardtemplate.innerHTML = `
                            <style>
                            .list-items {
                              flex: 1;
                              display: flex;
                              flex-direction: column;
                              align-content: start;
                              padding: 0 0.6rem 0.5rem;
                              overflow-y: auto;
                              height : 200px;
                            }
                            .list-items::-webkit-scrollbar {
                              width: 1.6rem;
                            }
                            .list-items::-webkit-scrollbar-thumb {
                              background-color: #c4c9cc;
                              border-right: 0.6rem solid #e2e4e6;
                            }
                            .list-items li {
                              font-size: 1.4rem;
                              font-weight: 400;
                              line-height: 1.3;
                              background-color: #fff;
                              padding: 0.65rem 0.6rem;
                              color: #4d4d4d;
                              border-bottom: 0.1rem solid #ccc;
                              border-radius: 0.3rem;
                              margin-bottom: 0.6rem;
                              word-wrap: break-word;
                              cursor: pointer;
                            }
                            .list-items li:last-of-type {
                              margin-bottom: 0;
                            }
                            .list-items li:hover {
                              background-color: #eee;
                            }

                            .add-card-btn {
                              display: block;
                              text-align: left;
                              cursor: pointer;
                             }

                             .field-list {
                              flex: 1;
                              display: flex;
                              flex-direction: column;
                              align-content: start;
                              padding: 0 0.6rem 0.5rem;
                              overflow-y: auto;
                            }

                            .field-list li {
                              font-size: 1.4rem;
                              font-weight: 400;
                              line-height: 1.3;
                              padding: 0 0 0.65rem 0;
                              color: #4d4d4d;
                              cursor: pointer;
                            }

                            input {
                              line-height: 2;
                              width: 24rem;
                            }

                            button {
                              background-color: #0079bf; /* Green */
                              border: none;
                              color: white;
                              text-align: center;
                              text-decoration: none;
                              display: inline-block;
                              font-size: 16px;
                              margin: 4px 2px;
                              cursor: pointer;
                            }
                      
                              </style>
                              <ul class="list-items">
                            </ul>	
                            <add-card-form></add-card-form>
                            `;

                            // <form>
                            // <ul class="field-list">
                            // <li><input type="text" name="cardName" id="cardName" placeholder="Name"/></li>
                            // <li><input type="text" name="cardDescription" id="cardDescription" placeholder="Description"/></li>
                            // <li><button id="add-card" class="add-card-btn btn">Add a card</button></li>
                            // </ul>
                            // </form>
                         
class CardItems extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this.cards = [];
  }

  handleEvent(e) {
    this.$listItem.forEach((item) => {
      if (item.id == e.target.id) {
        item.textContent = this.cards.filter(item => item.id == e.target.id)[0].description;
      }
    });
  }

  connectedCallback() {
    this.getCards();
  };

  async getCards() {
    const cards = await fetch('http://localhost:3000/cards');
    this.cards = await cards.json();
    this._render();
  };

  async postCards(card) {
    const cards = await fetch('http://localhost:3000/cards', {
      method: 'post', body: JSON.stringify(card), headers: {
        'Content-Type': 'application/json'
      }
    });
    window.location.reload(false);
  };

  async updateCards(id, card) {
    const cards = await fetch(`http://localhost:3000/cards/${id}`, {
      method: 'put', body: JSON.stringify(card), headers: {
        'Content-Type': 'application/json'
      }
    });
    window.location.reload(false);
  };

  dragstart(e) {
    start = e.target.attributes.column.value;
    target = e.target;
  }


  dragover(e) {
    e.preventDefault();
  }

  dragDrop(e) {
    //get Drop details.
    if (e.target.attributes.column.value !== start) {
      this.updateCards(target.id, {
        "title": target.innerHTML,
        "description": target.attributes.desc.value,
        "columnId": parseInt(this.id)
      });
    }
  }

  addCard(e) {
    e.preventDefault();
    const cardName = this._shadowRoot.querySelector('#cardName').value;
    const cardDescription = this._shadowRoot.querySelector('#cardDescription').value;
    if(cardName != '' && cardDescription != '') {
      this.postCards({
        "title": cardName,
        "description": cardDescription,
        "columnId": parseInt(this.id)
      });
    }
  };

  _render() {
    cardtemplate.content.querySelector('.list-items').innerHTML = '';
    

    this.id = this.getAttribute('id');
    cardtemplate.content.querySelector('add-card-form').setAttribute('id', this.id)

    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].columnId === parseInt(this.id)) {
        cardtemplate.content.querySelector('.list-items').innerHTML += `
        <li id="${this.cards[i].id}" desc="${this.cards[i].description}" column="${this.cards[i].columnId}" draggable="true">${this.cards[i].title}</li>    
        `;
      }
    }
    this._shadowRoot.appendChild(cardtemplate.content.cloneNode(true));

    // this.$addCardButton = this._shadowRoot.querySelector('#add-card');


    // this.$addCardButton.addEventListener('click', this.addCard.bind(this));

    this.$listItem = this._shadowRoot.querySelectorAll('li');
    this.$listItem.forEach((item) => {
      item.addEventListener('click', this);
      item.addEventListener('dragstart', this.dragstart);
      item.addEventListener('dragend', this.dragover);
      item.addEventListener('dragover', this.dragover);
      item.addEventListener('drop', this.dragDrop.bind(this));
    });
    this.$span = this._shadowRoot.querySelector('span');
  };


}

window.customElements.define('card-items', CardItems);
