
const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

const HAND_OPEN_SPRITE = "hand_open.png";
const HAND_CLOSED_SPRITE = "hand_closed.png";

const DECKS = [ 
    "yRuOiic",
    "IQHOnqa"
];

const cardInfo = { };

// const hoverTexts = {
//     rngesus: "RNGESUS.\nKing card. Is immortal.",
//     amogus: "DEAD MEME.\nIts presence on the board causes all your opponent's\n cards to be unable to destroy your cards.",
//     nemo: "NEMO.\n Its presence on the board reveals your opponent's hand at all times.",
//     deathstar: "THE DEATH STAR.\nEach turn this card is active, it immediately\n destroys all your enemies' cards.",
//     fountain: "FOUNTAIN OF OLD AGE.\nIts presence on the board renders all your enemies mortal.",
//     "1": "ANCIENT KANJI.\nWhile this card is in play, your opponent may no longer read.",
//     "2": "BLUE EYES GRAY ROCK.\nIs invincible. May not die. Ever.\nOnce it is put in play, it cannot be taken out of play",
//     "3": "LAND SHARK.\nWhile this card is in play, your opponent may not play any more cards.",
//     "4": "RADIANT TURRET.\nWhile this card is in play, the effects of any of your opponent's\ncards that are coloured apply to the opposite player now.",
//     "5": "BORING TURRET.\nWhile this card is in play, the effects of any of your opponent's\n cards that are not coloured apply to the opposite player now.",
//     "6": "MATER.\nWhile this card is in play, all the enemies' cards smell like farts.\nThe opponent may not breathe.",
//     "7": "LILYPAD.\nEvery turn, allows its owner to revive any of his killed cards.",
//     "8": "AK-47.\nAllows you to shoot any of your opponent's effects, thereby\ncancelling them.",
//     "9": "PRIMARY SCHOOL.\nAs long as this card is active, its owner allowed to read and do math.",
//     "10": "EYE OF THE TIGER.\nWhile this card is active, any card you\ncan see is now yours.",
//     "11": "DIAMOND SWORD.\nWhile this card is in play, all your cards are immune to\n damage-reducing effects.",
//     "12": "AXE.\n Every turn this card is active, all your enemies' cards get destroyed.",
//     "13": "SEXY MINER.\n Any of the opponent's effects that target this card\ncauses the opponent's king to be killed in an FBI raid.",
//     "14": "CAPITALISM.\n As long as this card is active, the opponent may not take cards from his deck.",
//     "30": "OCTOPUS.\nSupremely intelligent, as long as this card is active, \n your opponent must say aloud which card he has taken from\n his deck.",

//     "15": "Albert the Wise - If this card attacks with an item equipped deal +1.",
//     "16": "Leela the Strong - This card levels up after 2 turns. Interrupted by Attackers. ",
//     "17": "Bernard the Dog - When this card enters the battlefield, the opponents discards their top 2 cards. ",
//     "18": "Cowardly Carl - When this card enters and is not the Main Hero, give 10+ HP to the Main Hero.",
//     "19": "Jeffrey the Hermit - Numerical Values on Items are doubled.",
//     "15": "Brainstormed Albert - This card may attack repeatedly per item card equipped.(+5 damage)",
//     "16": "Ripped Leela - You now have +5(+20) power.",
//     "17": "Hellhound Bernard - Upon Leveling Up, Opponent discards 2(6) cards either from their deck or from their hand. ",
//     "18": "Vengeful Carl - When this card attacks, you cant [cast spells](interupt).",
//     "19": "Jeffrey the Freed - Setting cards now increase power and defenses by 5[10] per item equipped.",
//     "20": "Doville - Power increase 2 (Power and Defense Increase 10)",
//     "21": "Riverbedside - At the end of each turn heal 2 (At the end of each turn heal 20 and gain 20 defense) ",
//     "22": "Hacksaw Ridge - Item cards cost -1 gold (Item Cards are free to Level 2 Heroes)",
//     "23": "The Greenery - Opponent cannot defend against the first attacker (The Opponent cannot block the main hero's attacks)",
//     "24": "Cyphill City - The Opponent must always reveal atleast one card in their hand (The Opponent must discard atleast one card a turn)",
//     "25": "Sword - Give +5 Power",
//     "26": "Shield- Give +5 defense",
//     "27": "Crossbow- Whenever the wielder attacks, give +2 attack.  ",
//     "28": "Hammer- The Wielder may interrupt the opponent while attacking. ",
//     "29": "Potion- Give +10 Defense and Power. Shuffle this back into he deck.",
// }

// Sample context menu item to move a stack to the center of the board
CardStacks.defaultContextMenuItems.push({
    text: "Duplicate",
    message: "The other player has duplicated that stack",
    action: stack => {
        const s = CardStacks.instantiate(stack.cards, { ...stack.pos }, stack.isFaceDown);
        s.beginDrag();
    }
});

CardStacks.defaultContextMenuItems.push({
    text: "Delete",
    message: "The other player has deleted that stack",
    action: stack => {
        CardStacks.destroy(stack.id);
    }
});

let otherMouseDown = false;

let onMouseDown = e => {

    Game.selfMousePos = Util.browserToCanvasCoords(Game.canvas, e);

    // Make sure the network buffer is empty before beginning the mousedown operation
    // (this will save a lot of headaches in the future)
    NetworkBuffer.assertEmpty();
    NetworkBuffer.addOne("mousePos", {
        pos: Game.selfMousePos,
        immediate: true
    });

    // If the left or middle mouse buttons are down, send a message to the other client
    // saying that it should display the "fist" sprite 
    if(e.button == LEFT_MOUSE_BUTTON || e.button == MIDDLE_MOUSE_BUTTON)
        NetworkBuffer.addOne("mouseDown", true);

    // Try to interact with any open context menus, and only allow card dragging
    // if we didn't click on any context menu items
    const canDrag = !CardStacks.interactWithContextMenus();
    if(canDrag) {

        // For each card stack...
        for (const stack of CardStacks.active) {

            // If the mouse isn't over the card stack or if this stack is being
            // used by the other player, continue
            if(!stack.isHovering() || stack.isOccupiedByOtherPlayer()) continue;

            // Otherwise, if the stack is being left clicked (or middle-clicked but it's only 1 card)...
            if(e.button == LEFT_MOUSE_BUTTON || (e.button == MIDDLE_MOUSE_BUTTON && stack.cards.length == 1)) {
                // Begin dragging this stack
                stack.beginDrag();
                break;
            }

            // Otherwise if the stack is being middle clicked and the mouse is over the 
            // top-most card...
            else if(e.button == MIDDLE_MOUSE_BUTTON && stack.isHoveringTopmostCard()) {
                // Take the topmost card from the stack and begin dragging it
                const newStack = stack.separate(1);
                newStack.beginDrag();
                break;
            }
        }
    }

    // Having completed the mousedown operation, send everything to the other client
    NetworkBuffer.send();
};

let onMouseUp = e => {
    // Make sure the network buffer is empty before beginning the mousedown operation
    NetworkBuffer.assertEmpty();

    // If the left or middle mouse buttons have been released, send a message to the 
    // other client saying that it should display the "hand spead out" sprite 
    if(e.button == LEFT_MOUSE_BUTTON || e.button == MIDDLE_MOUSE_BUTTON)
        NetworkBuffer.addOne("mouseDown", false);

    // For each card stack...
    for (const stack of CardStacks.active) {
        
        // If the card stack is being dragged, and if the left mouse button is being
        // released (or the middle mouse button if the stack is just one card)...
        if(stack.isSelfDragging && (e.button == LEFT_MOUSE_BUTTON || (e.button == MIDDLE_MOUSE_BUTTON && stack.cards.length == 1))) {
            
            // Stop dragging the stack
            stack.endDrag();

            // For every *other* stack of cards...
            for (const otherStack of CardStacks.active) {
                if(stack == otherStack) continue;

                // If the stack that was being dragged is close enough to this
                // stack, combine the stacks together
                if(Util.dist(stack.pos, otherStack.getTopCardRect()) < 50) {
                    otherStack.combine(stack);
                    break;
                }
            }
        }

        // Otherwise if the right mouse button is the one that's being released,
        // and the mouse is currently over this stack, and this stack isn't being
        // used by the other player in any way, open the stack's context menu
        else if(e.button == RIGHT_MOUSE_BUTTON && !stack.isOccupiedByOtherPlayer() && stack.isHovering()) {
            stack.openContextMenu(Game.selfMousePos);
            break;
        }

    }

    // Having completed the mousedown operation, send everything to the other client
    NetworkBuffer.send();
}

let onKeyUp = e => {
    // If the R key has been released (after being pressed)...
    if(e.code == "KeyR" && GameNetwork.isHost) { 
        if(window.confirm("You are about to reset the game. Are you sure?")) {
            // Tell the other client to reset their game
            Game.send({
                resetGame: true
            });

            // And reset our own game
            Notifications.send("Game reset.");
            Game.reset(); 
        }
    }
}

// Since there are infinite possibilities of how to go about controlling a game
// on mobile (tap, double tap, tap and hold, tap with multiple fingers, etc.), I 
// will make no assumptions and have only written the bare minimum as a template, 
// (dragging cards around on mobile) and leave it up to the programmer.
// See onMouseDown and onMouseUp above for a straightforward example on how to
// manipulate stacks in response to input events.

let onTouchStart = e => { 
    // Prevent default mobile events
    e.preventDefault();
    e.stopImmediatePropagation();

    // Assume that the "mouse position" is the first touch point
    let touchPoint = Util.browserToCanvasCoords(Game.canvas, e.touches[0]);
    Game.selfMousePos = touchPoint;

    // Send our mouse position to the other client before dragging
    NetworkBuffer.assertEmpty();
    NetworkBuffer.addOne("mousePos", {
        pos: Game.selfMousePos,
        immediate: true
    });

    // For each stack...
    for (const stack of CardStacks.active) {
        // If the mouse isn't over the card stack, continue
        if(!stack.isHovering() || stack.isOccupiedByOtherPlayer()) continue;

        // If we're actually dragging, notify the other client that he should display the
        // "hand in a fist" sprite
        NetworkBuffer.addOne("mouseDown", true);

        // Begin dragging
        stack.beginDrag();
        break;
    }

    // Send all the network data to the other client
    NetworkBuffer.send();
};

let onTouchEnd = e => { 
    // Prevent default mobile events
    e.preventDefault();
    e.stopImmediatePropagation();

    // Make sure the network buffer is empty
    NetworkBuffer.assertEmpty();

    // Stop dragging any dragged stacks
    for (const stack of CardStacks.active) {
        if(stack.isSelfDragging)
            stack.endDrag();
    }
    
    // Tell the other client to use the "hand spread out" sprite
    NetworkBuffer.addOne("mouseDown", false);

    // Send all that info to the other client
    NetworkBuffer.send();
};

let onTouchMove = e => {
    // Prevent default mobile events
    e.preventDefault();
    e.stopImmediatePropagation();

    // Update our "mouse position" in response to any touches
    Game.selfMousePos = Util.browserToCanvasCoords(Game.canvas, e.touches[0]);
}

// Called exactly once before the game starts. Is only ever called once, ever.
Game.onInit = () => {

    // Subscribe to some canvas events. These are regular old canvas events 
    // that anyone can look up on W3Schools or Mozilla web docs
    Game.canvasEvent("mousedown", onMouseDown);
    Game.canvasEvent("mouseup", onMouseUp);
    Game.canvasEvent("touchstart", onTouchStart);
    Game.canvasEvent("touchmove", onTouchMove);
    Game.canvasEvent("touchend", onTouchEnd);

    // Listen for keypresses
    window.addEventListener('keyup', onKeyUp, false);

    // Create 2 effect areas, one for the host's hand and one for the guest's hand.
    // We'll make it so that cards inside the zone will only be visible to the zone's
    // owner.
    const hostHand = new EffectArea(GameNetwork.isHost? "Your hand" : "The other player's hand", 10, 10, Game.WIDTH - 20, 100);
    const guestHand = new EffectArea(GameNetwork.isHost? "The other player's hand" : "Your hand", 10, Game.HEIGHT - 110, Game.WIDTH - 20, 100);
    
    // If this client isn't the host, then hide cards that go here
    hostHand.onStackEnter = stack => {
        if(!GameNetwork.isHost) stack.isHidden = true;
    };

    // If this client isn't the guest, then hide cards that go here
    guestHand.onStackEnter = stack => {
        if(GameNetwork.isHost) stack.isHidden = true;
    };

    // Removing a card from the zone will no longer make it hidden
    const reveal = stack => { stack.isHidden = false; };
    guestHand.onStackExit = reveal;
    hostHand.onStackExit = reveal;

    // Register these effect areas
    EffectAreas.active.push(hostHand);
    EffectAreas.active.push(guestHand);

    let amountLoaded = 0;
    for (const deck of DECKS) {
        const headers = new Headers();
        headers.append("Authorization", "Client-ID fefe95129b82295");
        fetch("https://api.imgur.com/3/album/" + deck + "/images", {
            method: "GET",
            headers: headers,
            mode: 'cors',
            cache: 'default' 
        }).then(response => {
            response.json().then(json => {
                for (const image of json.data) {
                    const cardName = image.link.substring(0, image.link.lastIndexOf("."));
                    cardInfo[cardName] = {
                        deck: deck,
                        desc: image.description
                    };

                    let lineLength = 0;
                    let lineNumber = 0;
                    const maxLineLength = 30;
                    const card = cardInfo[cardName];
                    for (let i = 0; i < card.desc.length; i++) {
                        const char = card.desc[i];
                        if(char == "\n") {
                            lineNumber++;
                            lineLength = 0;
                            continue;
                        }
                        else if(char == " ") {
                            if(lineLength >= maxLineLength) {
                                lineNumber++;
                                lineLength = 0;
                                card.desc = card.desc.substring(0, i) + "\n" + card.desc.substring(i);
                                continue;
                            }
                        }
                        else {
                            lineLength++;
                            continue;
                        }
                    }
                }

                Sprites.fetch(json.data.map(x => x.link));

                amountLoaded++;

                if(amountLoaded >= DECKS.length) {
                    // Arrange the board
                    Game.reset();
                }
            });
        });
    }

}

// Called automatically every time the game board needs to be reset (including
// initial setup of the game board). Can also be called manually to reset
// the game arbitrarily
Game.reset = () => {
    CardStacks.reset(); // Delete all card stacks, if there are any

    // Place 4 stacks of cards side-by-side
    // CardStacks.instantiate(Util.CARDS_CLUBS, { x: 10, y: 150 }, false, true);
    // CardStacks.instantiate(Util.CARDS_DIAMONDS, { x: 10 + (10 + GAME_INFO.defaultCardWidth) * 1, y: 150 }, false, true);
    // CardStacks.instantiate(Util.CARDS_HEARTS, { x: 10 + (10 + GAME_INFO.defaultCardWidth) * 2, y: 150 }, false, true);
    // CardStacks.instantiate(Util.CARDS_SPADES, { x: 10 + (10 + GAME_INFO.defaultCardWidth) * 3, y: 150 }, false, true);
    
    // CardStacks.instantiate([ "rngesus" ], { x: 10, y: 10 }, false, true);
    // CardStacks.instantiate([ "amogus", "nemo", "deathstar", "fountain", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "13", "14", "30" ], { x: 100, y: 10 }, false, true);

    // CardStacks.instantiate([ "17" ], { x: 200, y: 10 }, false, true);
    // CardStacks.instantiate([ "15", "16", "18", "19", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "19" ], { x: 300, y: 10 }, false, true);

    let x = 10;
    for (const deck of DECKS) {
        const keys = Object.getOwnPropertyNames(cardInfo);
        let cards = keys.filter(x => cardInfo[x].deck == deck);
        // console.log(keys);
        // console.log(cards);
        CardStacks.instantiate([ cards[0] ], { x: x, y: 150 }, false, true);
        CardStacks.instantiate(cards.slice(1, cards.length), { x: x + 100, y: 150 }, true, true);
        x += 200;
    }

}

// Called automatically every frame
Game.tick = (dt, g) => {
    Graphics.clear(g, "green");

    // Update and draw effect areas
    EffectAreas.updateAll(dt);
    EffectAreas.drawAll(g);

    // Update and draw card stacks
    CardStacks.updateAll(dt);
    CardStacks.drawAll(g);

    // Draw the other player's mouse cursor
    let handSprite = Sprites.get(otherMouseDown? HAND_CLOSED_SPRITE : HAND_OPEN_SPRITE);
    g.drawImage(handSprite, Game.otherMousePosSmooth.x - handSprite.width / 2, Game.otherMousePosSmooth.y - handSprite.height / 2, handSprite.width, handSprite.height);

    // Draw context menus
    CardStacks.drawAllContextMenus(g);

    const width = 200;
    const height = 200;
    const left = Game.selfMousePos.x + 10;
    const top = Game.selfMousePos.y + 10;
    for (const stack of CardStacks.active) {
        if(stack.isHovering() && !stack.isHidden && !stack.isFaceDown) {
            // g.fillStyle = "black";
            // g.beginPath();
            // g.rect(left, top, width, height);
            // g.stroke();

            // g.fillStyle = "rgb(200, 200, 200)";
            // g.fillRect(left, top, width, height);
                
            g.textAlign = "left";
            g.textBaseline = "top"; 
            // const lines = hoverTexts[stack.getTop()].split("\n");
            const topCardDesc = cardInfo[stack.getTop()].desc.trim();
            if(!topCardDesc) continue;

            
            const lines = topCardDesc.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                g.font = "12px Arial";
                g.fillStyle = "black";
                g.fillText(line, left + 5, top + 5 + i * 15); 
            }

            break;
        }
    }

    // Update and draw the messages at the bottom right
    Notifications.tick(dt, g);
}

// Called automatically whenever data is received from the other player
Game.netReceive = data => {

    // These are all required for built-in things like syncing card stacks,
    // effect areas, etc.
    Game.receiveOtherMousePos(data); // Receive the other player's mouse position
    Game.receiveResetEvent(data); // Receive the "reset game" event if it ever comes
    CardStacks.receiveNetworkEvents(data); // Receive all the events related to card stacks
    EffectAreas.receiveNetworkEvents(data); // Receive all the events related to effect areas
    Notifications.receiveMessages(data); // Receive any event messages 

    // Finally, some game-specific code which will update the other player's
    // "mouse down status" if "mouseDown" happens to be included in the data
    // we received
    otherMouseDown = data.mouseDown === undefined? otherMouseDown : data.mouseDown;
}

// Called automatically at GAME_INFO.networkTickrate times per second,
// the return value is what gets sent to the other player
Game.netTick = dt => {
    return {
        // Return some arbitrary JSON
    };
}