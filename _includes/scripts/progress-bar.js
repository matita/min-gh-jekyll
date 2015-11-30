      var d = document.createElement('div');
      d.className = 'progress-bar';
      d.style.width = '0';
      document.body.appendChild(d);

      document.onscroll = function() {
        var top = document.body.scrollTop || document.documentElement.scrollTop;
        d.style.width = (top + window.innerHeight) * 100 / document.body.scrollHeight + '%';
      };