+++
title = "Style guide: Writing"
author = ["Cash Prokop-Weaver"]
date = 2022-02-05T13:12:00-08:00
lastmod = 2026-01-04T21:15:00-08:00
tags = ["meta"]
categories = ["meta"]
draft = false
slug = "05911fff-a79b-4462-bf6d-a3cec4e1c9f2"
+++

A style guide for how I prefer to write in general and, specifically, in these [notes]({{< relref "how_i_write_notes.md" >}}).


## Prose {#prose}

I try to write with an emphasis on clear communication.

-   [Use plain language]({{< relref "use_plain_language.md" >}})
-   [Use serial commas]({{< relref "use_serial_commas.md" >}})
-   [Vary the length of sentences]({{< relref "this_sentence_has_five_words.md" >}})
-   [Be useful]({{< relref "HowWriteUsefully.md" >}})
-   [Avoid qualifying language]({{< relref "avoid_qualifying_language.md" >}})
-   [Be explicit]({{< relref "be_explicit.md" >}})
-   [Bottom line up front]({{< relref "bottom_line_up_front.md" >}})
-   [Structure your writing]({{< relref "structure_your_writing.md" >}})
-   Use 'Sentence case', as opposed to than 'Title Case', in headings and titles


## Quotes {#quotes}

-   [Large quotes are okay]({{< relref "large_quotes_are_okay.md" >}})


### Attribution {#attribution}

-   Place attributions on the last line of the quote.
-   The attribution may, but doesn't have to, be _italicized_.
-   The form of the attribution should be one of, in order of preference:
    1.  **Ideal**: "&lt;link to person&gt;, &lt;citation&gt;"
    2.  "&lt;citation&gt;"
    3.  "&lt;link to person&gt;"
    4.  "&lt;general link&gt;"


#### Does it need attribution? {#does-it-need-attribution}

Every quote should contain an attribution unless it meets one of the following criteria:

1.  The quote is from a cited source which appears in the node's bibliography and this source is the **only** citation present in the node.


#### Examples {#examples}

> I am increasingly convinced that the difference between effective and ineffective people is their skill at developing a theory of change.
>
> Aaron Swartz, (<a href="#citeproc_bib_item_2">Swartz 2010</a>)

<!--quoteend-->

> Muad'Dib learned rapidly because his first training was in how to learn. And the first lesson of all was the basic trust that he could learn. It's shocking to find how many people do not believe they can learn, and how many more believe learning to be difficult. Muad'Dib knew that every experience carries its lesson.
>
> _Princess Irulan, (<a href="#citeproc_bib_item_1">Herbert 1999</a>)_

<!--quoteend-->

> Org is a mode for keeping notes, maintaining TODO lists, and project planning with a fast and effective plain-text markup language. It also is an authoring system with unique support for literate programming and reproducible research.
>
> _[org-mode Manual: Summary](https://orgmode.org/manual/Summary.html)_


### Nodes can just be a quote {#nodes-can-just-be-a-quote}

Quotes can live in stand-alone single nodes (eg: [The First Lesson]({{< relref "the_first_lesson.md" >}})). This is multi-purpose:

1.  When in doubt, make the [note smaller]({{< relref "write_prolifically_write_succinctly.md" >}}).
2.  Easier to link to specific quotes: Suppose a reader clicks on a link and arrives on a page with five quotes visible. That's confusing.
3.  Works in a transclusion model better than larger nodes


### Links {#links}

1.  Preserve links in the original quote to point to the original location or to a node representing the same idea.
2.  Wrap added links with square brackets just as you would with additional text.


## Links {#links}


### Show favicons alongside links {#show-favicons-alongside-links}

Favicons are nice additions to links. They provide visual context to where the reader expects the link to take them. Include them alongside external links. I've written a [script to make the process easier](https://github.com/cashweaver/basic-favicon-links).


### Every node must include backlinks {#every-node-must-include-backlinks}

Backlinks are the backbone of a powerful [zettelkasten]({{< relref "Zettelkasten2021.md" >}}) system. The published form of these notes **must** include backlinks.


## Bibliography {#bibliography}

<style>.csl-entry{text-indent: -1.5em; margin-left: 1.5em;}</style><div class="csl-bib-body">
  <div class="csl-entry"><a id="citeproc_bib_item_1"></a>Herbert, Frank. 1999. <i>Dune</i>. London: Victor Gollancz.</div>
  <div class="csl-entry"><a id="citeproc_bib_item_2"></a>Swartz, Aaron. 2010. “Theory of Change.” March 14, 2010. <a href="http://www.aaronsw.com/weblog/theoryofchange">http://www.aaronsw.com/weblog/theoryofchange</a>.</div>
</div>


## Backlinks {#backlinks}

-   [How I write notes]({{< relref "how_i_write_notes.md" >}})
