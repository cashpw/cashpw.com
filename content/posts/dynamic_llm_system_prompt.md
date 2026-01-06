+++
title = "Dynamic LLM system prompt"
author = ["Cash Prokop-Weaver"]
date = 2025-12-31T12:55:00-08:00
lastmod = 2026-01-05T20:02:00-08:00
draft = false
slug = "fd0e23cc-0610-41fd-a50a-b9fa6147b190"
+++

LLM performance improves with a good prompt. I've found success by tailoring the prompt to the relevant domain (for example: role-prompting as a senior software engineer when asking a coding question). I use a local{{< sidenote >}}Qwen 3 0.6b through Ollama{{< /sidenote >}}LLM to categorize each prompt and select the most appropriate [system prompt]({{< relref "llm_prompts.md" >}}).


## Select prompt {#select-prompt}

```emacs-lisp
(defun strip-ansi-chars (str)
  "Remove ansi escape characters from STR.
Source: https://old.reddit.com/r/emacs/comments/18xaakz/remove_ansi_escape_sequences_from_shell_process/kgdr9zi/"
  (let ((clean-str (ansi-color-apply str)))
    (set-text-properties 0 (length clean-str) nil clean-str)
    clean-str))

(defun strip-ollama-progress-spinner (str)
  "Return STR without ollama's progress spinner characters."
  (replace-regexp-in-string "[⠙⠹⠸⠼⠴⠦⠧⠇⠋⠏]" "" str))

(defun llm-prompts-select-prompt (&optional prompt)
  "Return appropriate llm system prompt for given PROMPT."
  (message "Selecting best system prompt...")
  (let*
      ((prompt
        (or prompt
            (with-current-buffer (gptel--create-prompt-buffer (point))
              (buffer-substring-no-properties (point-min) (point-max)))))
       (response
        (s-trim
         (strip-ollama-progress-spinner
          (strip-ansi-chars
           (shell-command-to-string
            (format
             "ollama run qwen3:0.6b --hidethinking \"Determine whether the following text is related to programming and coding or not. Response with either 'code' when the text is about programming and 'general' otherwise.

Example: Write a function in Python to add two numbers.
Response: code

Example: What are some useful patterns to utilize when writing documentation?
Response: general

Categorize this:

%s\"" prompt)))))))
    (cond
     ((string= response "code")
      (cashpw/log "Using code system prompt.")
      llm-prompts-prompt--code)
     (t
      (cashpw/log "Using default system prompt.")
      llm-prompts-prompt--default))))
```
