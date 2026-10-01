(function () {
  var STORAGE_KEY = 'portfolio-v1';
  var page = document.querySelector('.wrap');   // all page content
  var root = document.documentElement;          // <html>, holds the theme
  var bar = document.getElementById('bar');     // editor toolbar
  var editButton = document.getElementById('tb-edit');
  var resetButton = document.getElementById('tb-reset');
  var urlInput = document.getElementById('tb-url');

  var editing = false;       
  var selectedButton = null; 
  var EDITABLE = [
    'h1', 'h2', 'h3', 'section p', '.lead', '.when', '.log li li',
    '.tags span', '.facts b', '.facts span', '.btn', 'nav strong', 'footer'
  ].join(',');

  function stripEditorParts(element) {
    element.querySelectorAll('.ctl').forEach(function (el) {
      el.remove();
    });
    element.querySelectorAll('[contenteditable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
    });
  }

  function save() {
    try {
      var copy = page.cloneNode(true);
      stripEditorParts(copy);
      localStorage.setItem(STORAGE_KEY, copy.innerHTML);
    } catch (error) {
    }
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      page.innerHTML = saved;
    }
  } catch (error) {
  }

  function decorate() {
    stripEditorParts(page);
    if (!editing) return;

    page.querySelectorAll(EDITABLE).forEach(function (el) {
      el.setAttribute('contenteditable', 'true');
    });

    page.querySelectorAll('.log>li, .card').forEach(function (item) {
      var controls = document.createElement('div');
      controls.className = 'ctl';
      controls.contentEditable = 'false';
      controls.innerHTML =
        '<button data-act="dup">Duplicate</button>' +
        '<button data-act="del">Delete</button>';
      item.appendChild(controls);
    });
    page.querySelectorAll('.tags').forEach(function (group) {
      var addButton = document.createElement('button');
      addButton.className = 'ctl';
      addButton.dataset.act = 'addtag';
      addButton.textContent = '+ Add';
      group.appendChild(addButton);
    });
  }
  function setEditing(on) {
    editing = on;
    document.body.classList.toggle('editing', on);
    editButton.textContent = on ? 'Done editing' : 'Edit page';

    urlInput.disabled = true;
    urlInput.value = '';
    selectedButton = null;

    decorate();
    if (!on) save();
  }

  function showToolbar(visible) {
    bar.classList.toggle('on', visible);
  }

  // Keep the editor hidden by default and only reveal it when the user triggers it.
  showToolbar(false);

  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      showToolbar(!bar.classList.contains('on'));
    }
  });

  editButton.addEventListener('click', function () {
    setEditing(!editing);
  });

  var resetArmed = false;

  resetButton.addEventListener('click', function () {
    if (!resetArmed) {
      resetArmed = true;
      resetButton.textContent = 'Click again to reset';
      setTimeout(function () {
        resetArmed = false;
        resetButton.textContent = 'Reset';
      }, 3000);
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
    }
    location.reload();
  });

  document.getElementById('tb-dl').addEventListener('click', function () {
    var copy = root.cloneNode(true);
    stripEditorParts(copy);
    copy.querySelector('body').classList.remove('editing');

    var link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob(['<!DOCTYPE html>\n' + copy.outerHTML], { type: 'text/html' })
    );
    link.download = 'portfolio.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (target.id === 'theme') {
      var isDark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : matchMedia('(prefers-color-scheme:dark)').matches;
      root.dataset.theme = isDark ? 'light' : 'dark';
      return;
    }

    if (!editing) return;

    if (target.closest('.btn')) {
      event.preventDefault();
    }

    var tag = target.closest('.tags span');
    if (tag && event.shiftKey) {
      tag.remove();
      save();
      return;
    }

    var action = target.dataset && target.dataset.act;
    if (!action) return;

    if (action === 'addtag') {
      var newTag = document.createElement('span');
      newTag.textContent = 'New skill';
      target.parentNode.insertBefore(newTag, target);
    } else {
      var item = target.closest('.log>li, .card');

      if (action === 'del') {
        item.remove();
      } else {
        var copy = item.cloneNode(true);
        stripEditorParts(copy);
        item.parentNode.insertBefore(copy, item.nextSibling);
      }
    }
    decorate();
    save();
  });

  document.addEventListener('focusin', function (event) {
    var button = editing && event.target.closest && event.target.closest('.btn');
    if (button) {
      selectedButton = button;
      urlInput.disabled = false;
      urlInput.value = button.getAttribute('href') || '';
    }
  });
  urlInput.addEventListener('input', function () {
    if (selectedButton) {
      selectedButton.setAttribute('href', urlInput.value);
      save();
    }
  });

  // Save after every text edit
  document.addEventListener('input', function (event) {
    if (editing && event.target !== urlInput) {
      save();
    }
  });
})();