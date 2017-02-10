var state = {
  currentSearch: null,
  currentKey: null,
  firstResult: null,
  dirty: true,
}

// Save the current file.
const save = () => {
  if(state.dirty && state.currentKey != null) {
    localStorage.setItem(state.currentKey, $('#editable').html());
    update();
  }
  state.dirty = false;
}

// Restore the file.
const restore = () => {
  if (localStorage.getItem(state.currentKey)) {
    $('#editable').html(localStorage.getItem(state.currentKey))
  } else {
    $('#editable').html('<div># Title</div>')
  }
  setTimeout(() => {
    $('#editable').get(0).focus()
  })
}

// Update the menu.
const updateMenu = () => {
  var results = '';
  var firstResult = null;
  for (var i = 0; i < localStorage.length; i ++) {
    let key = localStorage.key(i);
    if (key.match(new RegExp(state.currentSearch || '', 'i'))) {
      if (!firstResult) {
        firstResult = key;
      }
      results += '<div>' + key + '</div>';
    }
  }
  if (!firstResult && state.currentSearch && state.currentSearch.length > 0) {
    firstResult = state.currentSearch;
  }
  state.firstResult = firstResult;
  if (results.length > 0) {
    $('#results').html(results)
  } else {
    $('#results').html('<span id="empty">empty</empty>')
  }
}

// Updates the editable view.
const updateEditable = () => {
  $("#editable").contents().filter(function() {
    return this.nodeType === 3;
  }).wrap("<div></div>").end()

  let code = false;

  $('#editable').children('div').each((i, d) => {
    $(d).removeClass('h1 h2 h3 h4 b1 b2 b3 code comment');

    if($(d).text().trim().substr(0,3) === '```') {
      code = !code
      $(d).addClass('code');
    }

    if ($(d).text().trim().substr(0,2) === '//') {
      $(d).addClass('comment');
    }

    if (!code) {
      // h1, h2, h3, h4
      if ($(d).text().substr(0,5) === '#### ') {
        $(d).addClass('h4');
      }
      if ($(d).text().substr(0,4) === '### ') {
        $(d).addClass('h3');
      }
      if ($(d).text().substr(0,3) === '## ') {
        $(d).addClass('h2');
      }
      if ($(d).text().substr(0,2) === '# ') {
        $(d).addClass('h1');
      }

      // b1, b2, b3
      if ($(d).text().substr(0,2) === '- ') {
        $(d).addClass('b1');
      }
      if ($(d).text().substr(0,3) === '-- ') {
        $(d).addClass('b2');
      }
      if ($(d).text().substr(0,4) === '--- ') {
        $(d).addClass('b3');
      }
    } else {
      $(d).addClass('code');
    }
  })
}

// Updates the views.
const update = () => {
  if (state.currentKey != null) {
    $('#editable').addClass('visible')
    $('#menu').removeClass('visible')
    updateEditable();
  } else {
    $('#menu').addClass('visible')
    $('#editable').removeClass('visible')
    updateMenu();
  }
}

$('#editable').on('input', event => {
  state.dirty = true;
  update();
})

$('#search').on('focus', event => {
  save();
  state.currentKey = null;
  state.currentSearch = '';
  $('#search').val('');
  update();
})

$('#search').on('input', event => {
  save();
  state.currentKey = null;
  state.currentSearch = $('#search').val();
  update();
})

$('#search').on('keyup', event => {
  if (event.keyCode == 13) {
    if (state.firstResult) {
      $('#search').val(state.firstResult);
      state.dirty = true;
      state.currentKey = state.firstResult;
      state.currentSearch = null;
      restore()
      update();
    }
  }
});

setInterval(save, 1000);
update();
$('#search').focus()
