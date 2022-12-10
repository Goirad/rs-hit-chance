function loadChangeHooks(cookie) {
  // set up so that when a user clicks into or out of the filter field
  // the list appears and disappears
  let searchBox = document.getElementById("target-filter");
  let targetRow = document.getElementById("target-wrapper");
  searchBox.addEventListener("focus", function () {
    // this just resets the list, since on focus the search is empty
    filterTargetList();
    targetRow.style.display = "block";
  });
  searchBox.addEventListener("blur", function () {
    // clear the search
    searchBox.value = "";
    targetRow.style.display = "none";
  });

  // hook into the familiar select, and load from cookie if present
  const familiarElem = document.getElementById("familiar");
  if (cookie.familiar.name) {
    familiarElem.value = cookie.familiar.name;
  }

  familiarElem.addEventListener("change", function () {
    familiar();
    calc();
    writeCookie();
  });

  // hook into reset button
  // TODO is there a better way to achieve a reset without a reload?
  const resetElem = document.getElementById("reset-button");
  resetElem.addEventListener("click", function () {
    clearCookie();
    location.reload();
  });
}

// Fetches the current value of the "target" label, and uses that to set
// all the appropriate state fields. It also sets UI elements based on
// the contents of the targetData dataset.
function loadTarget() {
  let target = document.getElementById("target").innerText;

  // set state
  state.target = targetData[target];
  state.taggable = targetData[target].taggable;
  // taggable is weird because it's also an input button
  const taggable = document.getElementById("taggable");
  taggable.innerText = state.taggable ? "Yes" : "No";
  taggable.style["background-color"] = state.taggable ? "#47705b" : "#6c4b58";

  // Set ui fields
  const targetDefence = document.getElementById("target-defence");
  targetDefence.innerText = state.target.defence;

  const targetArmour = document.getElementById("target-armour");
  targetArmour.innerText = state.target.armour;

  const targetWeakness = document.getElementById("target-weakness");
  targetWeakness.innerText = state.target.weakness;
  const targetWeaknessIcon = document.getElementById("target-weakness-icon");
  targetWeaknessIcon.src = playerBuffs.style.icons[state.target.weakness];

  const targetStyle = document.getElementById("target-style");
  targetStyle.innerText = state.target.style;
  const targetStyleIcon = document.getElementById("target-style-icon");
  targetStyleIcon.src = playerBuffs.style.icons[state.target.style];

  const targetAffinityWeakness = document.getElementById("target-affinity-weakness");
  targetAffinityWeakness.innerText = state.target.affinity.weakness;
  const targetAffinityMelee = document.getElementById("target-affinity-melee");
  targetAffinityMelee.innerText = state.target.affinity.melee;
  const targetAffinityRange = document.getElementById("target-affinity-range");
  targetAffinityRange.innerText = state.target.affinity.range;
  const targetAffinityMagic = document.getElementById("target-affinity-magic");
  targetAffinityMagic.innerText = state.target.affinity.magic;
}

// Change the "display" style on list elements according to the current value
// of the "target-filter" input element.
function filterTargetList() {
  let targetList = document.getElementById("target-list");
  let searchBox = document.getElementById("target-filter");
  let targetLabel = document.getElementById("target");

  // Get the search query
  let query = searchBox.value;
  let queryWords = query.split(" ");
  queryWords = queryWords.map(function (word) {
    return word.toLowerCase();
  });

  // Filter the options based on the query
  let results = Array.from(targetList.childNodes).filter(function (target) {
    // Convert the option to lower case for case-insensitive matching
    const targetLower = target.innerText.toLowerCase();

    // Check if each query word is included in the option
    let isMatch = queryWords.every(function (queryWord) {
      return targetLower.indexOf(queryWord) >= 0;
    });

    target.style.display = isMatch ? "list-item" : "none";
  });
}

// Populates the "target-list" element with "<li>"s according to the contents
// of the targetData dataset. This is only run once per page load, and also
// handles loading the target from a cookie if present;
function loadTargets(cookie) {
  // grab references to the target related elements
  // table row element that holds the whole thing
  let targetList = document.getElementById("target-list");
  // input element that stores the filter
  let searchBox = document.getElementById("target-filter");
  // label element that displays the currently selected target
  let targetLabel = document.getElementById("target");

  // TODO use the first element of targetData as the default instead
  let selected = "Araxxi";
  // load previous value from cookie if applicable
  if (cookie.target.name) {
    selected = cookie.target.name;
  }
  targetLabel.innerText = selected;

  // list of all the "<li>" elements
  let targets = [];
  for (let target of Object.keys(targetData)) {
    let opt = document.createElement("li");
    opt.innerText = target;
    opt.addEventListener("mousedown", function () {
      targetLabel.innerText = target;
      searchBox.value = "";
      loadTarget();
      writeCookie();
      window.scrollBy(0, -20000);
      calc();
    });
    targets.push(opt);
    targetList.appendChild(opt);
  }

  // detect enter and assume you're picking the top visible item
  searchBox.addEventListener("keydown", function (e) {
    if (e.key === 'Enter' || e.code === 'Enter') {
      let topItem = targets.find(function (target) {
        return target.style.display === "list-item"
      });
      if (topItem) {
        searchBox.value = "";
        targetLabel.innerText = topItem.innerText;
        searchBox.blur();
        loadTarget();
        writeCookie();
        calc();
      }
    }
  });

  // Listen for changes to the search box
  searchBox.addEventListener("input", function () {
    filterTargetList();
  });
}

// Load familiars from the familiarData dataset. Also handles loading the
// familiar from a cookie if present.
function loadFamiliars(cookie) {
  const familiarElem = document.getElementById("familiar");
  // TODO use the first element of familiarData as the default instead
  let selected = "Ripper demon";
  if (cookie.target.name) {
    selected = cookie.target.name;
  }
  for (let familiar of Object.keys(familiarData)) {
    let opt = document.createElement("option");
    opt.value = familiar;
    if (familiar === selected) {
      opt.selected = true;
    }
    opt.innerText = familiar;
    familiarElem.appendChild(opt);
  }
}

// Set state fields according the value of the "familiar" element
function familiar() {
  const familiarElem = document.getElementById("familiar");
  const familiar = familiarElem.value;
  // set state
  state.familiar = familiarData[familiar];
}

// Generate a row object that matches the spec provided
//
// returns the generated table row element
function generateInput(id, spec, previous) {
  // generate html
  let row = document.createElement("tr");
  let iconCell = document.createElement("td");
  iconCell.className = "icon-col";
  let icon = document.createElement("img");
  iconCell.appendChild(icon);
  row.appendChild(iconCell);
  let textCell = document.createElement("td");
  row.appendChild(textCell);
  let inputCell = document.createElement("td");
  inputCell.className = "input-col";

  // null checks are handled by the calculator
  let input;
  if (spec.kind === "bool") {
    // Create a simple button that changes color
    input = document.createElement("button");
    input.id = id;
    icon.src = spec.icon;
    textCell.innerText = spec.text;
    // for initialization
    state[id] = false;
    if (previous) {
      state[id] = previous;
    }
    input.innerText = state[id] ? "Yes" : "No";
    input.style["background-color"] = state[id] ? "#47705b" : "#6c4b58";

    input.addEventListener(
      "click",
      function () {
        state[id] = !state[id];
        input.style["background-color"] = state[id] ? "#47705b" : "#6c4b58";
        input.innerText = state[id] ? "Yes" : "No";
        calc();
        writeCookie();
      }
    );
  } else if (spec.kind === "select") {
    // Create a simple dropdown
    input = document.createElement("select");
    input.id = id;
    textCell.innerText = spec.text;
    let selected = previous;
    if (!selected) {
      selected = Object.keys(spec.labels)[0];
    }
    for (let opt of Object.keys(spec.labels)) {
      let option = document.createElement("option");
      option.innerText = spec.labels[opt];
      if (opt === selected) {
        input.value = spec.labels[opt];
        option.selected = true;
      }
      input.appendChild(option);
    }
    icon.src = spec.icons ? spec.icons[selected] : spec.icon;
    input.addEventListener("change",
      function () {
        let selected;
        for (let key of Object.keys(spec.labels)) {
          if (spec.labels[key] === input.value) {
            selected = key;
          }
        }
        state[id] = selected;
        icon.src = spec.icons ? spec.icons[selected] : spec.icon;
        calc();
        writeCookie();
      }
    );
    // for initialization
    state[id] = selected;
  } else if (spec.kind === "number") {
    // Create a simple text field
    input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.size = 1;
    input.value = spec.default;
    if (previous) {
      input.value = previous;
    }
    input.addEventListener(
      "change",
      function () {
        state[id] = input.value;
        calc();
        writeCookie();
      }
    );
    icon.src = spec.icon;
    textCell.innerText = spec.text;
    // for initialization
    state[id] = input.value;
  } else {
    // console.log("unknown kind " + spec.kind);
  }

  inputCell.appendChild(input);
  row.appendChild(inputCell);

  return row
}

// Load all the setup fields from the objects provided by ui_dataset.js
// The objects are organized into these groups in the data, but there's
// no strict requirement for that. It's purely a way to organize the data
// visually.
function loadSetupFields(cookie) {
  const buffTableElem = document.getElementById("player-buff-table");
  // playerBuffs loaded from ui_dataset.js
  for (let field of Object.keys(playerBuffs)) {
    let row = generateInput(field, playerBuffs[field], cookie[field]);
    buffTableElem.appendChild(row);
  }

  const targetDebuffTableElem = document.getElementById("target-debuff-table");
  // targetDebuffs loaded from ui_dataset.js
  for (let field of Object.keys(targetDebuffs)) {
    let row = generateInput(field, targetDebuffs[field], cookie[field]);
    targetDebuffTableElem.appendChild(row);
  }

  const playerDebuffTableElem = document.getElementById("player-debuff-table");
  // playerDebuffs loaded from ui_dataset.js
  for (let field of Object.keys(playerDebuffs)) {
    let row = generateInput(field, playerDebuffs[field], cookie[field]);
    playerDebuffTableElem.appendChild(row);
  }

  const familiarTable = document.getElementById("familiar-table");
  // familiarBuffs loaded from ui_dataset.js
  for (let field of Object.keys(familiarBuffs)) {
    let row = generateInput(field, familiarBuffs[field], cookie[field]);
    familiarTable.appendChild(row);
  }
}

function writeCookie() {
  document.cookie = JSON.stringify(state);
}

function clearCookie() {
  document.cookie = "";
}

function readCookie() {
  let cookie = {target: {}, familiar: {}};
  try {
    cookie = JSON.parse(document.cookie);
  } catch (error) {
    console.log(error);
  }
  return cookie;
}

function init() {
  let cookie = readCookie();
  loadChangeHooks(cookie);
  loadTargets(cookie);
  loadFamiliars(cookie);
  loadSetupFields(cookie);
  familiar();
  loadTarget();
  calc();
  writeCookie();
}

init();
