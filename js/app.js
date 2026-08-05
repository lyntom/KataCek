/* ==========================================================================
   KataCek — Script Logic Utama
   Aplikasi Pengenalan Suara dan Kamus Bahasa Indonesia
   ========================================================================== */

$(function () {
  /* ------------------------------------------------------------------------
   * 1. Theme Switcher Logic (Light & Dark Mode)
   * ------------------------------------------------------------------------ */
  function updateThemeUI(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("katacek_theme", theme);

    const $icon = $("#themeToggleIcon");
    const $text = $("#themeToggleText");
    const $metaTheme = $('meta[name="theme-color"]');

    if (theme === "dark") {
      $icon.attr("class", "fa-solid fa-sun text-warning");
      $text.text("Mode Terang");
      $metaTheme.attr("content", "#0b1329");
    } else {
      $icon.attr("class", "fa-solid fa-moon");
      $text.text("Mode Gelap");
      $metaTheme.attr("content", "#0d6efd");
    }
  }

  // Initial sync from data-bs-theme set in head
  const initialTheme =
    document.documentElement.getAttribute("data-bs-theme") || "light";
  updateThemeUI(initialTheme);

  $("#themeToggleBtn").on("click", function () {
    const currentTheme =
      document.documentElement.getAttribute("data-bs-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    updateThemeUI(nextTheme);
  });

  /* ------------------------------------------------------------------------
   * 2. Application Variables & Initialization
   * ------------------------------------------------------------------------ */
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const definitionModal = new bootstrap.Modal(
    document.getElementById("definitionModal"),
  );
  let recognition = null;
  let dictionary = {};
  let isRecording = false;
  let manualStop = false;
  let lastProcessedIndex = -1;
  let restartTimer = null;
  let interimCommitTimer = null;

  // Load Dictionary JSON Database
  $.getJSON("dictionary.json")
    .done(function (data) {
      dictionary = data.kata || {};

      $("#dictionaryCount").text(
        Object.keys(dictionary).length.toLocaleString("id-ID"),
      );

      $("#loadingAlert")
        .removeClass("alert-info")
        .addClass("alert-success")
        .html(
          '<i class="fa-solid fa-circle-check me-2"></i>' +
            "Database kamus berhasil dimuat.",
        );

      $("#startBtn").prop("disabled", !SpeechRecognition);

      setTimeout(function () {
        $("#loadingAlert").slideUp();
      }, 1500);
    })
    .fail(function () {
      $("#loadingAlert")
        .removeClass("alert-info")
        .addClass("alert-danger")
        .html(
          '<i class="fa-solid fa-triangle-exclamation me-2"></i>' +
            "dictionary.json gagal dimuat. Jalankan aplikasi melalui web server lokal.",
        );
      $("#startBtn").prop("disabled", !SpeechRecognition);
    });

  if (!SpeechRecognition) {
    $("#browserWarning").removeClass("d-none");
  }

  /* ------------------------------------------------------------------------
   * 3. Text Normalization & Number Helper Functions
   * ------------------------------------------------------------------------ */
  function numberToWords(str) {
    const ones = [
      "",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima",
      "enam",
      "tujuh",
      "delapan",
      "sembilan",
      "sepuluh",
      "sebelas",
    ];

    function convertNum(n) {
      n = parseInt(n, 10);
      if (isNaN(n)) return "";
      if (n === 0) return "nol";
      if (n < 12) return ones[n];
      if (n < 20) return convertNum(n - 10) + " belas";
      if (n < 100)
        return convertNum(Math.floor(n / 10)) + " puluh " + convertNum(n % 10);
      if (n < 200) return "seratus " + convertNum(n - 100);
      if (n < 1000)
        return (
          convertNum(Math.floor(n / 100)) + " ratus " + convertNum(n % 100)
        );
      if (n < 2000) return "seribu " + convertNum(n - 1000);
      if (n < 1000000)
        return (
          convertNum(Math.floor(n / 1000)) + " ribu " + convertNum(n % 1000)
        );
      return n.toString();
    }

    return String(str || "").replace(/\b\d+\b/g, function (match) {
      return convertNum(match);
    });
  }

  function normalizeWord(value) {
    return String(value || "")
      .toLocaleLowerCase("id-ID")
      .replace(/[^a-zà-ÿ0-9'-]/gi, "")
      .replace(/^[-']+|[-']+$/g, "");
  }

  /* ------------------------------------------------------------------------
   * 4. Speech Recognition Engine
   * ------------------------------------------------------------------------ */
  function createRecognition() {
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {}
    }

    recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      isRecording = true;
      lastProcessedIndex = -1;

      $("#statusBadge")
        .removeClass("text-bg-secondary")
        .addClass("text-bg-danger")
        .html('<span class="recording-dot me-2"></span>Sedang merekam');

      $("#startBtn").prop("disabled", true);
      $("#stopBtn").prop("disabled", false);
    };

    recognition.onresult = function (event) {
      let interimText = "";
      let maxInterimIndex = -1;
      let hasFinalInThisEvent = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
          hasFinalInThisEvent = true;
          if (i > lastProcessedIndex) {
            lastProcessedIndex = i;
            if (transcript) {
              addMessage(transcript);
            }
          }
        } else {
          interimText += transcript + " ";
          maxInterimIndex = Math.max(maxInterimIndex, i);
        }
      }

      const currentInterim = interimText.trim();
      showInterim(currentInterim);

      clearTimeout(interimCommitTimer);
      if (currentInterim && !hasFinalInThisEvent) {
        // Fast Commit after 500ms of silence
        interimCommitTimer = setTimeout(function () {
          if (currentInterim) {
            if (maxInterimIndex >= 0) {
              lastProcessedIndex = Math.max(
                lastProcessedIndex,
                maxInterimIndex,
              );
            }
            addMessage(currentInterim);
            showInterim("");
          }
        }, 500);
      }
    };

    recognition.onerror = function (event) {
      console.warn("SpeechRecognition error:", event.error);
      const messages = {
        "not-allowed":
          "Izin mikrofon ditolak. Periksa izin mikrofon pada browser Anda.",
        "audio-capture": "Mikrofon tidak ditemukan.",
        network: "Terjadi gangguan jaringan pada layanan pengenalan suara.",
        "no-speech": "Tidak ada suara yang terdeteksi.",
        aborted: "Perekaman dihentikan.",
      };

      if (!["aborted", "no-speech"].includes(event.error)) {
        showError(
          messages[event.error] || "Kesalahan mikrofon: " + event.error,
        );
      }
    };

    recognition.onend = function () {
      clearTimeout(interimCommitTimer);

      if (isRecording && !manualStop) {
        lastProcessedIndex = -1;
        clearTimeout(restartTimer);
        restartTimer = setTimeout(function () {
          if (isRecording && !manualStop && recognition) {
            try {
              recognition.start();
            } catch (error) {
              console.warn("Restart error, recreating recognition:", error);
              try {
                createRecognition();
                recognition.start();
              } catch (e) {
                setStoppedState();
              }
            }
          }
        }, 60);
        return;
      }

      setStoppedState();
    };
  }

  /* ------------------------------------------------------------------------
   * 5. UI Renderers & Event Handlers
   * ------------------------------------------------------------------------ */
  function addMessage(text) {
    const cleanText = String(text || "").trim();

    if (!cleanText) return;

    $("#emptyState, #interimRow").remove();

    const textWithWords = numberToWords(cleanText);

    let words = textWithWords
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);

    // Fallback if normalization removed all tokens
    if (!words.length) {
      words = cleanText.split(/\s+/).filter(Boolean);
    }

    if (!words.length) return;

    const timeString = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const $row = $(
      '<div class="chat-row mb-3 d-flex align-items-end justify-content-end gap-2"></div>',
    );
    const $bubble = $('<div class="chat-bubble"></div>');
    const $content = $('<div class="chat-bubble-content"></div>');

    words.forEach(function (word) {
      const definitions = dictionary[word];
      const isValid = Array.isArray(definitions) && definitions.length > 0;

      const $word = $("<button>", {
        type: "button",
        class: "word " + (isValid ? "word-valid" : "word-invalid"),
        text: word,
        title: isValid
          ? "Klik meilhat penjelasan"
          : "Kata tidak ditemukan",
      })
        .data("word", word)
        .data("definitions", definitions || []);

      $content.append($word).append(" ");
    });

    const $time = $(
      `<div class="chat-time"><i class="fa-regular fa-clock"></i> ${timeString}</div>`,
    );

    $bubble.append($content).append($time);

    const $avatar = $(
      '<div class="chat-avatar" title="Suara Pengguna"><i class="fa-solid fa-user"></i></div>',
    );

    $row.append($bubble).append($avatar);

    $("#chatArea").append($row);
    updateStats();
    scrollBottom();
  }

  $(document).on("click", ".word", function () {
    const word = $(this).data("word");
    const definitions = $(this).data("definitions") || [];

    $("#modalWord").text(word);

    const $container = $("#modalDefinitions").empty();

    if (!definitions.length) {
      $container.html(
        '<div class="alert alert-danger mb-0">' +
          "Kata tidak ditemukan dalam database." +
          "</div>",
      );
    } else {
      definitions.forEach(function (definition, index) {
        const $item = $(
          '<div class="definition-item border rounded-3 p-3 mb-2"></div>',
        );

        $item
          .append($("<strong>").text(index + 1 + ". "))
          .append(document.createTextNode(definition));

        $container.append($item);
      });
    }

    definitionModal.show();
  });

  function showInterim(text) {
    $("#interimRow").remove();

    if (!text) return;

    $("#emptyState").remove();

    const $interimRow = $(`
      <div id="interimRow" class="chat-row mb-3 d-flex align-items-end justify-content-end gap-2">
        <div class="chat-bubble interim-bubble">
          <div class="interim-content d-flex align-items-center gap-2">
            <span class="spinner-grow spinner-grow-sm text-primary" role="status"></span>
            <span>${text}…</span>
          </div>
        </div>
        <div class="chat-avatar interim-avatar" title="Merekam Suara..."><i class="fa-solid fa-microphone-lines"></i></div>
      </div>
    `);

    $("#chatArea").append($interimRow);
    scrollBottom();
  }

  function clearChat() {
    lastProcessedIndex = -1;
    clearTimeout(interimCommitTimer);

    $("#chatArea").html(`
      <div id="emptyState" class="empty-state">
        <div class="empty-icon-wrapper">
          <i class="fa-solid fa-comments fa-2x"></i>
        </div>
        <h6 class="fw-bold mb-1">Siap Mendengarkan</h6>
        <p class="small text-dark mb-0">Tekan <strong>Mulai Merekam</strong>, lalu mulailah berbicara.</p>
      </div>
    `);

    updateStats();
  }

  function updateStats() {
    $("#validCount").text($(".word-valid").length);
    $("#invalidCount").text($(".word-invalid").length);
  }

  function scrollBottom() {
    const area = $("#chatArea")[0];
    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  }

  function showError(message) {
    $("#chatArea").prepend(
      $(
        '<div class="alert alert-danger alert-dismissible fade show py-2 my-2 me-2 ms-2"></div>',
      )
        .text(message)
        .append(
          '<button type="button" class="btn-close py-2" data-bs-dismiss="alert" aria-label="Close"></button>',
        ),
    );
  }

  function setStoppedState() {
    isRecording = false;
    clearTimeout(restartTimer);
    clearTimeout(interimCommitTimer);

    $("#statusBadge")
      .removeClass("text-bg-secondary")
      .addClass("text-bg-danger")
      .html('<i class="fa-solid fa-circle-stop me-1"></i> Perekaman berhenti');

    $("#startBtn").prop("disabled", false);
    $("#stopBtn").prop("disabled", true);

    showInterim("");
  }

  /* ------------------------------------------------------------------------
   * 6. User Control Buttons
   * ------------------------------------------------------------------------ */
  $("#startBtn").on("click", function () {
    if ($("#resetOnStart").is(":checked")) {
      clearChat();
    }

    manualStop = false;
    lastProcessedIndex = -1;

    if (!recognition) {
      createRecognition();
    }

    try {
      recognition.start();
    } catch (error) {
      console.warn("Start error, recreating recognition instance:", error);
      createRecognition();
      try {
        recognition.start();
      } catch (err) {
        showError(
          "Gagal memulai pengenalan suara. Pastikan mikrofon aktif & diizinkan.",
        );
        setStoppedState();
      }
    }
  });

  $("#stopBtn").on("click", function () {
    manualStop = true;
    isRecording = false;
    clearTimeout(restartTimer);
    clearTimeout(interimCommitTimer);

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }

    setStoppedState();
  });

  $("#clearBtn").on("click", clearChat);

  if (SpeechRecognition) {
    createRecognition();
  }
});
