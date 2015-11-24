---
title: How do Promises Work? - Quils in Space
description: Extending Fold and Unfold to Exponential Embarassing-ness
link: http://robotlolita.me/2015/11/15/how-do-promises-work.html?utm_source=SitePoint&utm_medium=email&utm_campaign=Versioning
saved: 2015-11-24 15:37:29
---


  <h2>Table of Contents</h2>

<ul id="markdown-toc">
  <li><a href="#introduction">1. Introduction</a></li>
  <li><a href="#a-conceptual-understanding-of-promises">2. A Conceptual Understanding of Promises</a>    <ul>
      <li><a href="#interlude-the-girl-who-hated-queues">Interlude: The Girl Who Hated Queues</a></li>
      <li><a href="#what-are-promises">2.1. What Are Promises?</a></li>
      <li><a href="#interlude-order-of-execution">Interlude: Order of Execution</a></li>
      <li><a href="#promises-and-concurrency">2.2. Promises and Concurrency</a></li>
      <li><a href="#interlude-abstracting-over-expressions">Interlude: Abstracting Over Expressions</a></li>
    </ul>
  </li>
  <li><a href="#understanding-the-promises-machinery">3. Understanding the Promises Machinery</a>    <ul>
      <li><a href="#sequencing-expressions-with-promises">3.1. Sequencing Expressions with Promises</a></li>
      <li><a href="#a-minimal-promise-implementation">3.2. A Minimal Promise Implementation</a></li>
    </ul>
  </li>
  <li><a href="#promises-and-error-handling">4. Promises and Error Handling</a>    <ul>
      <li><a href="#interlude-when-computations-fail">Interlude: When Computations Fail</a></li>
      <li><a href="#handling-errors-with-promises">4.1. Handling Errors With Promises</a></li>
      <li><a href="#failure-propagation-with-promises">4.2. Failure Propagation With Promises</a></li>
    </ul>
  </li>
  <li><a href="#combining-promises">5. Combining Promises</a>    <ul>
      <li><a href="#combining-promises-deterministically">5.1. Combining Promises Deterministically</a></li>
      <li><a href="#combining-promises-non-deterministically">5.2. Combining Promises Non-Deterministically</a></li>
    </ul>
  </li>
  <li><a href="#a-practical-understanding-of-promises">6. A Practical Understanding of Promises</a>    <ul>
      <li><a href="#introducing-ecmascript-promises">6.1. Introducing ECMAScript Promises</a></li>
      <li><a href="#a-closer-look-into-then">6.2. A Closer Look Into <code>.then</code></a></li>
    </ul>
  </li>
  <li><a href="#when-are-promises-a-bad-fit">7. When Are Promises A Bad Fit?</a></li>
  <li><a href="#conclusion">8. Conclusion</a></li>
  <li><a href="#references">References</a></li>
  <li><a href="#additional-resources">Additional Resources</a></li>
  <li><a href="#resources-and-libraries">Resources and Libraries</a></li>
</ul>

<h2 id="introduction">1. Introduction</h2>

<p>Most implementations of JavaScript happen to be single-threaded, and given the
language’s semantics, people tend to use <em>callbacks</em> to direct concurrent
processes. While there isn’t anything particularly wrong with using
<a href="http://matt.might.net/articles/by-example-continuation-passing-style/">Continuation-Passing Style</a> in JavaScript, in practice it’s very easy for
them to make the code harder to read, and more procedural than it should be.</p>

<p>Many solutions for this have been proposed, and the usage of promises to
synchronise these concurrent processes is one of them. In this blog post
we’ll look at what promises are, how they work, and why you should or
shouldn’t use them.</p>

<blockquote class="note">
  <p><strong class="heading">Note</strong>
This article assumes the reader is at least familiar with higher-order
functions, closures, and callbacks (continuation-passing style).  You
might still be able to get something out of this article without that
knowledge, but it’s better to come back after acquiring a basic
understanding of those concepts.</p>
</blockquote>

<h2 id="a-conceptual-understanding-of-promises">2. A Conceptual Understanding of Promises</h2>

<p>Let’s start from the beginning and answer a very important question:
“What <em>are</em> promises anyway?”</p>

<p>To answer this question, we’ll consider a very common scenario in real
life.</p>

<h3 id="interlude-the-girl-who-hated-queues">Interlude: The Girl Who Hated Queues</h3>

<p class="pull-left"><img src="/files/2015/09/promises-01.png" alt="">
<em>Girfriends trying to have dinner at a very popular food place.</em></p>

<p>Alissa P. Hacker and her girlfriend decided to have dinner at a very
popular restaurant. Unfortunately, as it was to be expected, when they
arrived there all of the tables were already occupied.</p>

<p class="clear">In some places, this would mean that they would either have to give up
and choose somewhere else to eat, or wait in a long queue until they
could get a table. But Alissa hated queues, and this place had the
perfect solution for her.</p>

<blockquote class="highlight-paragraph pull-in">
  <p>“This is a magical device that represents your future table…”</p>
</blockquote>

<p class="pull-right"><img src="/files/2015/09/promises-02.png" alt="">
<em>A device that represents your future table in the restaurant.</em></p>

<p>“Worry not, my dear, just hold on to this device, and everything will be
taken care of for you,” the lady at the restaurant said, as she held a
small box.</p>

<p>“What is this…?” Alissa’s girlfriend, Rue Bae, asked.</p>

<p class="clear">“This is a magical device that represents your future table at this
restaurant,” the lady spoke, then beckoned to Bae. “There’s no magic,
actually, but it’ll tell you when your table is ready so you can come
and eat,” she whispered.</p>

<h3 id="what-are-promises">2.1. What Are Promises?</h3>

<p>Much like the “magical” device that stands in for your future table at
the restaurant, promises exist to represent <em>something</em> that will be
available in the future. In a programming language, these things are
values.</p>

<p class="pull-left"><img src="/files/2015/09/promises-03.png" alt="">
<em>Whole apple in, apple slices out.</em></p>

<p>In the synchronous world, it’s very simple to understand computations
when thinking about functions: you put things into a function, and the
function gives you something in return.</p>

<p>This <em>input-goes-in-output-comes-out</em> model is very simple to
understand, and something most programmers are very familiar with. All
syntactic structures and built-in functionality in JavaScript assume
that your functions will follow this model.</p>

<p class="clear">There is one big problem with this model, however: in order for us to be
able to get our delicious things out when we put things into the
function, we need to sit there and wait until the function is done with
its work. But ideally we would want to do as many things as we can with
the time we have, rather than sit around waiting.</p>

<p>To solve this problem promises propose that, instead of waiting for the
value we want, we get something that represents that value right
away. We can then move on with our lives, and, at some later point in
time, come back to get the value we need.</p>

<blockquote class="highlight-paragraph">
  <p>Promises are representations of eventual values.</p>
</blockquote>

<p class="centred-image"><img src="/files/2015/09/promises-04.png" alt="">
<em>Whole apple in, ticket for rescuing our delicious apple slices later out.</em></p>

<h3 id="interlude-order-of-execution">Interlude: Order of Execution</h3>

<p>Now that we, hopefully, understand what a promise is, we can look at how
promises help us write concurrent programs in an easier way. But before
we do that, let’s take a step back and think about a more fundamental
problem: the order of execution of our programs.</p>

<p>As a JavaScript programmer you might have noticed that your program
executes in a very peculiar order, which happens to be the order in
which you write the instructions in your program’s source code:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">circleArea</span> <span class="o">=</span> <span class="mi">10</span> <span class="o">*</span> <span class="mi">10</span> <span class="o">*</span> <span class="nb">Math</span><span class="p">.</span><span class="nx">PI</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">squareArea</span> <span class="o">=</span> <span class="mi">20</span> <span class="o">*</span> <span class="mi">20</span><span class="p">;</span>
</pre></div>
</td></tr></tbody></table>

<p>If we execute this program, first our JavaScript VM will run the
computation for <code>circleArea</code>, and once it’s finished, it’ll execute the
computation for <code>squareArea</code>. In other words, our programs are telling
the machines “Do this. Then do that. Then do that. Then…”</p>

<blockquote class="note info">
  <p><strong class="heading">Question time!</strong>
Why must our machine execute <code>circleArea</code> before <code>squareArea</code>? Would
there be any issues if we inverted the order, or executed both at
the same time?</p>
</blockquote>

<p>Turns out, executing everything in order is very expensive. If
<code>circleArea</code> takes too long to finish, then we’re blocking <code>squareArea</code>
from executing at all until then. In fact, for this example, it doesn’t
matter which order we
 pick, the result is always going to be the
same. The order expressed in our programs is too arbitrary.</p>

<blockquote class="highlight-paragraph">
  <p>[…] order is very expensive.</p>
</blockquote>

<p>We want our computers to be able to do more things, and do more things
<em>faster</em>. To do so, let’s, at first, dispense with order of execution
entirely. That is, we’ll assume that in our programs all expressions
are executed at the exact same time.</p>

<p>This idea works very well with our previous example. But it breaks as
soon as we try something slightly different:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3
4</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">radius</span> <span class="o">=</span> <span class="mi">10</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">circleArea</span> <span class="o">=</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nb">Math</span><span class="p">.</span><span class="nx">PI</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">squareArea</span> <span class="o">=</span> <span class="mi">20</span> <span class="o">*</span> <span class="mi">20</span><span class="p">;</span>
<span class="nx">print</span><span class="p">(</span><span class="nx">circleArea</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>If we don’t have any order at all, how can we compose values coming from
other expressions? Well, we can’t, since there’s no guarantee that the
value would have been computed by the time we need it.</p>

<p>Let’s try something different. The only order in our programs will be
defined by the dependencies between the components of the
expressions. Which, in essence, means that expressions are executed as
soon as all of its components are ready, even if other things are
already executing.</p>

<p class="centred-image full-image"><img src="/files/2015/09/promises-05.png" alt="">
<em>The dependency graph for our simple example.</em></p>

<p>Instead of having to declare which order the program should use when
executing, we’ve only defined how each computation depends on each
other. With that data in hand, a computer can create the dependency
graph above, and figure out itself the most efficient way of executing
this program.</p>

<blockquote class="note trivia">
  <p><strong class="heading">Fun fact!</strong>
The graph above describes very well how programs are evaluated
in the Haskell programming language, but it’s also very close
to how expressions are evaluated in more well-known systems, such as
Excel.</p>
</blockquote>

<h3 id="promises-and-concurrency">2.2. Promises and Concurrency</h3>

<p>The execution model described in the previous section, where order is
defined simply by the dependencies between each expression, is very
powerful and efficient, but how do we apply it to JavaScript?</p>

<p>We can’t apply this model directly to JavaScript because the language
semantics are inherently synchronous and sequential. But we can create a
separate mechanism to describe dependencies between expressions, and to
resolve these dependencies for us, executing the program according to
those rules. One way to do this is by introducing this concept of
dependencies on top of promises.</p>

<p>This new formulation of promises consists of two major components:
Something that makes representations of values, and can put values in
this representation. And something that creates a dependency between one
expression and a value, creating a new promise for the result of the
expression.</p>

<p class="pull-left width-350"><img src="/files/2015/09/promises-06.png" alt="">
<em>Creating representations of future values.</em>
<img src="/files/2015/09/promises-07.png" alt="">
<em>Creating dependencies between values and expressions.</em></p>

<p>Our promises represent values that we haven’t computed yet. This
representation is opaque: we can’t see the value, nor interact with the
value directly. Furthermore, in JavaScript promises, we also can’t
extract the value from the representation. Once you put something in a
JavaScript promise, you <strong>cannot</strong> take it out of the promise <sup id="fnref:1"><a href="#fn:1" class="footnote">1</a></sup>.</p>

<p>This by itself isn’t much useful, because we need to be able to use
these values somehow. And if we can’t extract the values from the
representation, we need to figure out a different way of using
them. Turns out that the simplest way of solving this “extraction
problem” is by describing how we want our program to execute, by
explicitly providing the dependencies, and then solving this dependency
graph to execute it.</p>

<p class="clear">For this to work, we need a way of plugging the actual value in the
expression, and delaying the execution of this expression until strictly
needed. Fortunately JavaScript has got our back in this: first-class
functions serve exactly this purpose.</p>

<h3 id="interlude-abstracting-over-expressions">Interlude: Abstracting Over Expressions</h3>

<p>If one has an expression of the form <code>a + 1</code>, then it is possible to
abstract over this expression such that <code>a</code> becomes a value that can be
plugged in, once it’s ready. This way, the expression:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3
4
5
6</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="mi">2</span><span class="p">;</span>
<span class="nx">a</span> <span class="o">+</span> <span class="mi">1</span><span class="p">;</span>
<span class="c1">// { replace `a` by its current value }</span>
<span class="c1">// =&gt; 2 + 1</span>
<span class="c1">// { reduce the expression }</span>
<span class="c1">// =&gt; 3</span>
</pre></div>
</td></tr></tbody></table>

<p>Becomes the following lambda abstraction<sup id="fnref:2"><a href="#fn:2" class="footnote">2</a></sup>:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">abstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">a</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">return</span> <span class="nx">a</span> <span class="o">+</span> <span class="mi">1</span><span class="p">;</span>
<span class="p">};</span>

<span class="c1">// We can then plug `a` in:</span>
<span class="nx">abstraction</span><span class="p">(</span><span class="mi">2</span><span class="p">);</span>
<span class="c1">// =&gt; (a =&gt; a + 1)(2)</span>
<span class="c1">// { replace `a` by the provided value }</span>
<span class="c1">// =&gt; (2 =&gt; 2 + 1)</span>
<span class="c1">// { reduce the expression }</span>
<span class="c1">// =&gt; 2 + 1</span>
<span class="c1">// { reduce the expression }</span>
<span class="c1">// =&gt; 3</span>
</pre></div>
</td></tr></tbody></table>

<p>First-class functions are a very powerful concept (whether they are
anonymous — a lambda abstraction — or not). Since JavaScript has
them we can describe these dependencies in a very natural way, by
transforming the expressions that use the values of promises into
first-class functions so we can plug in the value later.</p>

<h2 id="understanding-the-promises-machinery">3. Understanding the Promises Machinery</h2>

<h3 id="sequencing-expressions-with-promises">3.1. Sequencing Expressions with Promises</h3>

<p>Now that we went through the conceptual nature of promises, we can start
understanding how they work in a machine. We’ll describe the
operations used to create promises, put values in them, and
describe the dependencies between expressions and values. For the sake
of our examples we’ll use the following very descriptive operations,
which happen to be used by no existing Promises implementation:</p>

<ul>
  <li>
    <p><code>createPromise()</code> constructs a representation of a value. The value
must be provided at later point in time.</p>
  </li>
  <li>
    <p><code>fulfil(promise, value)</code> puts a value in the promise, allowing
the expressions that depend on the value to be computed.</p>
  </li>
  <li>
    <p><code>depend(promise, expression)</code> defines a dependency between
the expression and the value of the promise. It returns a new
promise for the result of the expression, so new expressions can
depend on that value.</p>
  </li>
</ul>

<p>Let’s go back to the circles and squares example. For now, we’ll start
with the simpler one: turning the synchronous <code>squareArea</code> into a
concurrent description of the program by using promises. <code>squareArea</code> is
simpler because it only depends on the <code>side</code> value:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="c1">// The expression:</span>
<span class="kd">var</span> <span class="nx">side</span> <span class="o">=</span> <span class="mi">10</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">squareArea</span> <span class="o">=</span> <span class="nx">side</span> <span class="o">*</span> <span class="nx">side</span><span class="p">;</span>
<span class="nx">print</span><span class="p">(</span><span class="nx">squareArea</span><span class="p">);</span>

<span class="c1">// Becomes:</span>
<span class="kd">var</span> <span class="nx">squareAreaAbstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">side</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">side</span> <span class="o">*</span> <span class="nx">side</span><span class="p">);</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">};</span>
<span class="kd">var</span> <span class="nx">printAbstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">squareArea</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">print</span><span class="p">(</span><span class="nx">squareArea</span><span class="p">));</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>

<span class="kd">var</span> <span class="nx">sidePromise</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
<span class="kd">var</span> <span class="nx">squareAreaPromise</span> <span class="o">=</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">sidePromise</span><span class="p">,</span> <span class="nx">squareAreaAbstraction</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">printPromise</span> <span class="o">=</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">squareAreaPromise</span><span class="p">,</span> <span class="nx">printAbstraction</span><span class="p">);</span>

<span class="nx">fulfil</span><span class="p">(</span><span class="nx">sidePromise</span><span class="p">,</span> <span class="mi">10</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>This is a lot of noise, if we compare with the synchronous version of
the code, however this new version isn’t tied to JavaScript’s order of
execution. Instead, the only constraints on its execution are the
dependencies we’ve described.</p>

<h3 id="a-minimal-promise-implementation">3.2. A Minimal Promise Implementation</h3>

<p>There’s one open question left to be answered: how do we actually run
the code so the order follows from the dependencies we’ve described?
If we’re not following JavaScript’s execution order, something
else has to provide the execution order we want. </p>

<p>Luckily, this is easily definable in terms of the functions we’ve
used. First we must decide how to represent values and their
dependencies. The most natural way of doing this is by adding this data
to the value returned from <code>createPromise</code>.</p>

<p>First, Promises of <em>something</em> must be able to represent that value,
however they don’t necessarily contain a value at all times. A value is
only placed into the promise when we invoke <code>fulfil</code>. A minimal
representation for this would be:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-haskell" data-lang="haskell">1
2
3</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kr">data</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="n">something</span> <span class="ow">=</span> <span class="p">{</span>
  <span class="n">value</span> <span class="ow">::</span> <span class="n">something</span> <span class="o">|</span> <span class="n">null</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>A <code>Promise of something</code> springs into existence containing the value
<code>null</code>. At some later point in time someone may invoke the <code>fulfil</code>
function for that promise, and from there on the promise will contain the
given fulfilment value. Since promises can only be fulfilled once, that
value is what the promise will contain for the rest of the program.</p>

<p>Given that it’s not possible to figure out if a promise has already been
fulfilled by just looking at the <code>value</code> (<code>null</code> is a valid value), we
also need to keep track of the state the promise is in, so we don’t risk
fulfilling it more than once. This requires a small change to the our
previous representation:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-haskell" data-lang="haskell">1
2
3
4</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kr">data</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="n">something</span> <span class="ow">=</span> <span class="p">{</span>
  <span class="n">value</span> <span class="ow">::</span> <span class="n">something</span> <span class="o">|</span> <span class="n">null</span><span class="p">,</span>
  <span class="n">state</span> <span class="ow">::</span> <span class="s">"pending"</span> <span class="o">|</span> <span class="s">"fulfilled"</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>We also need to handle the dependencies that are created by the <code>depend</code>
function. A dependency is a function that will, eventually, be
filled with the value in the promise, so it can be evaluated. One
promise can have many functions which depend on its value, so
a minimal representation for this would be:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-haskell" data-lang="haskell">1
2
3
4
5</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kr">data</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="n">something</span> <span class="ow">=</span> <span class="p">{</span>
  <span class="n">value</span> <span class="ow">::</span> <span class="n">something</span> <span class="o">|</span> <span class="n">null</span><span class="p">,</span>
  <span class="n">state</span> <span class="ow">::</span> <span class="s">"pending"</span> <span class="o">|</span> <span class="s">"fulfilled"</span><span class="p">,</span>
  <span class="n">dependencies</span> <span class="ow">::</span> <span class="p">[</span><span class="n">something</span> <span class="ow">-&gt;</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="n">something_else</span><span class="p">]</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>Now that we’ve decided on a representation for our promises, let’s start
by defining the function that creates new promises:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">createPromise</span><span class="p">()</span> <span class="p">{</span>
  <span class="k">return</span> <span class="p">{</span>
    <span class="c1">// A promise starts containing no value,</span>
    <span class="nx">value</span><span class="o">:</span> <span class="kc">null</span><span class="p">,</span>
    <span class="c1">// with a "pending" state, so it can be fulfilled later,</span>
    <span class="nx">state</span><span class="o">:</span> <span class="s2">"pending"</span><span class="p">,</span>
    <span class="c1">// and it has no dependencies yet.</span>
    <span class="nx">dependencies</span><span class="o">:</span> <span class="p">[]</span>
  <span class="p">};</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>Since we’ve decided on our simple representation, constructing a new
object for that representation is fairly straightforward. Let’s move to
something more complicated: attaching dependencies to a promise.</p>

<p>One of the ways of solving this problem would be to put all of the
dependencies created in the <code>dependencies</code> field of the promise, then
feed the promise to an interpreter that would run the computations as
needed. With this implementation, no dependency would ever execute
before the interpreter is started. We’ll not implement promises this way
because it doesn’t fit how people usually write JavaScript programs<sup id="fnref:3"><a href="#fn:3" class="footnote">3</a></sup>.</p>

<p>Another way of solving this problem comes from the realisation that we
only really need to keep track of the dependencies for a promise while
the promise is in the <code>pending</code> state, because once a promise is
fulfilled we can just execute the function right away!</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">expression</span><span class="p">)</span> <span class="p">{</span>
  <span class="c1">// We need to return a promise that will contain the value of</span>
  <span class="c1">// the expression, when we're able to compute the expression</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

  <span class="c1">// If we can't execute the expression yet, put it in the list of</span>
  <span class="c1">// dependencies for the future value</span>
  <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
      <span class="c1">// We're interested in the eventual value of the expression</span>
      <span class="c1">// so we can put that value in our result promise.</span>
      <span class="nx">depend</span><span class="p">(</span><span class="nx">expression</span><span class="p">(</span><span class="nx">value</span><span class="p">),</span> <span class="kd">function</span><span class="p">(</span><span class="nx">newValue</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newValue</span><span class="p">);</span>
        <span class="c1">// We return an empty promise because `depend` requires one promise</span>
        <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
      <span class="p">})</span>
    <span class="p">});</span>

  <span class="c1">// Otherwise just execute the expression, we've got the value</span>
  <span class="c1">// to plug in ready!</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="nx">depend</span><span class="p">(</span><span class="nx">expression</span><span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">value</span><span class="p">),</span> <span class="kd">function</span><span class="p">(</span><span class="nx">newValue</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newValue</span><span class="p">);</span>
      <span class="c1">// We return an empty promise because `depend` requires one promise</span>
      <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
    <span class="p">})</span>
  <span class="p">}</span>

  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>The <code>depend</code> function takes care of executing our dependent expressions
when the value they’re waiting for is ready, but if we attach the
dependency too soon that function will just end up in an array
in the promise object, so our job is not done yet. For the second part
of the execution, we need to run the dependencies when we’ve got the
value. Luckily, the <code>fulfil</code> function can be used for this.</p>

<p>We can fulfil promises that are in the <code>pending</code> state by calling the
<code>fulfil</code> function with the value we want to put in the promise. This is
a good time to invoke any dependencies that were created before the
value of the promise was available, and takes care of the other half of
the execution.</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">fulfil</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">!==</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">throw</span> <span class="k">new</span> <span class="nb">Error</span><span class="p">(</span><span class="s2">"Trying to fulfil an already fulfilled promise!"</span><span class="p">);</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">=</span> <span class="s2">"fulfilled"</span><span class="p">;</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">value</span> <span class="o">=</span> <span class="nx">value</span><span class="p">;</span>
    <span class="c1">// Dependencies may add other dependencies to this promise, so we</span>
    <span class="c1">// need to clean up the dependency list and copy it so our</span>
    <span class="c1">// iteration isn't affected by that.</span>
    <span class="kd">var</span> <span class="nx">dependencies</span> <span class="o">=</span> <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span><span class="p">;</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span> <span class="o">=</span> <span class="p">[];</span>
    <span class="nx">dependencies</span><span class="p">.</span><span class="nx">forEach</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">expression</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">expression</span><span class="p">(</span><span class="nx">value</span><span class="p">);</span>
    <span class="p">});</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<h2 id="promises-and-error-handling">4. Promises and Error Handling</h2>

<h3 id="interlude-when-computations-fail">Interlude: When Computations Fail</h3>

<p>Not all computations can always produce a valid value. Some functions,
like <code>a / b</code>, or <code>a[0]</code> are partial, and thus only defined for a subset
of possible values for <code>a</code> or <code>b</code>. If we write programs that contain
partial functions, and we hit one of the cases that the function can’t
handle, we won’t be able to continue executing the program. In other
words, our entire program would crash.</p>

<p>A better way of incorporating partial functions in a program is by
making it total. That is, defining the parts of the function that
weren’t defined before. In general, this means that we consider the
cases the function can handle a form of “Success”, and the cases it
can’t handle a form of “Failure”. This alone already allows us to write
entire programs that may continue executing even when faced with a
computation that can’t produce a valid value:</p>

<p class="centred-image full-image"><img src="/files/2015/09/promises-08.png" alt="">
<em>Branching on partial functions</em></p>

<p>Branching on each possible failure is a reasonable way of handling them,
but not necessarily a practical one. For example, if we compose three
computations that could fail, that means we’d have to define at least 6
different branches, for the simplest composition!</p>

<p class="centred-image full-image"><img src="/files/2015/09/promises-09.png" alt="">
<em>Branching on every partial function</em></p>

<blockquote class="note trivia">
  <p><strong class="heading">Fun fact!</strong>
Some programming languages, like OCaml, prefer this style of error
handling because it’s very explicit on what’s happening. In general
functional programming favours explicitness, but some functional
languages, like Haskell, use an interface called Monad<sup id="fnref:4"><a href="#fn:4" class="footnote">4</a></sup> to make
error handling (among other things) more practical.</p>
</blockquote>

<p>Ideally, we’d like to write just <code>y / (x / (a / b))</code>, and handle
possible errors just once, for the entire composition, rather than
handling errors in each sub-expression. Programming languages have
different ways of letting you do this. Some let you ignore errors
entirely, or at least put off touching it as much as possible, like C
and Go. Some will let the program crash, but give you tools to recover
from the crashing, like Erlang. But the most common approach is to
assign a “failure handler” to a block of code where failures may
happen. JavaScript allows the latter approach through the <code>try/catch</code>
statement, for example.</p>

<p class="centred-image full-image"><img src="/files/2015/09/promises-10.png" alt="">
<em>One of the approaches for handling failures in a practical way</em></p>

<h3 id="handling-errors-with-promises">4.1. Handling Errors With Promises</h3>

<p>Our formulation of Promises so far does not admit failures. So, all of
the computations that happen in promises must always produce a valid
result. This is a problem if we were to run a computation like <code>a / b</code>
inside a promise, because if <code>b</code> is 0, like in <code>2 / 0</code>, that computation
can’t produce a valid result.</p>

<p class="pull-left"><img src="/files/2015/09/promises-11.png" alt="">
<em>Possible states of our new promise</em></p>

<p>We can modify our promise to contemplate the representation of failures
quite easily. Currently our promises start at the <code>pending</code> state, and
then it can only be fulfilled. If we add a new state, <code>rejected</code>, then
we can model partial functions in our promises. A computation that
succeeds would start at pending, and eventually move to <code>fulfilled</code>. A
computation that fails would start at pending, and eventually move to
<code>rejected</code>.</p>

<p>Since we now have the possibility of failure, the computations that
depend on the value of the promise also must be aware of that. For now
we’ll have our <code>depend</code> failure just take an expression to run when
the promise is fulfilled, and one expression to run when the promise is
rejected.</p>

<p class="clear">With this, our new representation of promises becomes:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-haskell" data-lang="haskell">1
2
3
4
5
6
7
8</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kr">data</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="p">(</span><span class="n">value</span><span class="p">,</span> <span class="ne">error</span><span class="p">)</span> <span class="ow">=</span> <span class="p">{</span>
  <span class="n">value</span> <span class="ow">::</span> <span class="n">value</span> <span class="o">|</span> <span class="ne">error</span> <span class="o">|</span> <span class="n">null</span><span class="p">,</span>
  <span class="n">state</span> <span class="ow">::</span> <span class="s">"pending"</span> <span class="o">|</span> <span class="s">"fulfilled"</span> <span class="o">|</span> <span class="s">"rejected"</span><span class="p">,</span>
  <span class="n">dependencies</span> <span class="ow">::</span> <span class="p">[{</span>
    <span class="n">fulfilled</span> <span class="ow">::</span> <span class="n">value</span> <span class="ow">-&gt;</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="n">new_value</span><span class="p">,</span>
    <span class="n">rejected</span>  <span class="ow">::</span> <span class="ne">error</span> <span class="ow">-&gt;</span> <span class="kt">Promise</span> <span class="kr">of</span> <span class="n">new_error</span>
  <span class="p">}]</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>The promise may contain either a proper value, or an error, and contains
<code>null</code> until it settles (is either fulfilled or rejected). To handle
this, our dependencies also need to know what to do for proper values
and error values, so the array of dependencies has to be changed
slightly.</p>

<p>Besides the change in representation, we need to change our <code>depend</code>
function, which now reads like this:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="c1">// Note that we now take two expressions, rather than one.</span>
<span class="kd">function</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">onSuccess</span><span class="p">,</span> <span class="nx">onFailure</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
    <span class="c1">// Dependencies now gets an object containing</span>
    <span class="c1">// what to do in case the promise succeeds, and</span>
    <span class="c1">// what to do in case the promise fails. The functions</span>
    <span class="c1">// are roughly the same as the previous ones.</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span><span class="p">.</span><span class="nx">push</span><span class="p">({</span>
      <span class="nx">fulfilled</span><span class="o">:</span> <span class="kd">function</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">depend</span><span class="p">(</span><span class="nx">onSuccess</span><span class="p">(</span><span class="nx">value</span><span class="p">),</span>
               <span class="kd">function</span><span class="p">(</span><span class="nx">newValue</span><span class="p">)</span> <span class="p">{</span>
                 <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newValue</span><span class="p">);</span>
                 <span class="k">return</span> <span class="nx">createPromise</span><span class="p">()</span>
               <span class="p">},</span>
               <span class="c1">// We have to care about errors that</span>
               <span class="c1">// happen when applying the expression too</span>
               <span class="kd">function</span><span class="p">(</span><span class="nx">newError</span><span class="p">)</span> <span class="p">{</span>
                 <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newError</span><span class="p">);</span>
                 <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
               <span class="p">});</span>
      <span class="p">},</span>

      <span class="c1">// The rejected branch does the same as the</span>
      <span class="c1">// fulfilled branch, but uses the onFailure</span>
      <span class="c1">// expression.</span>
      <span class="nx">rejected</span><span class="o">:</span> <span class="kd">function</span><span class="p">(</span><span class="nx">error</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">depend</span><span class="p">(</span><span class="nx">onFailure</span><span class="p">(</span><span class="nx">error</span><span class="p">),</span>
               <span class="kd">function</span><span class="p">(</span><span class="nx">newValue</span><span class="p">)</span> <span class="p">{</span>
                 <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newValue</span><span class="p">);</span>
                 <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
               <span class="p">},</span>
               <span class="kd">function</span><span class="p">(</span><span class="nx">newError</span><span class="p">)</span> <span class="p">{</span>
                 <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newError</span><span class="p">);</span>
                 <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
               <span class="p">});</span>
        <span class="p">}</span>
      <span class="p">});</span>
    <span class="p">}</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="c1">// if the promise has been fulfilled, we run onSuccess</span>
    <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"fulfilled"</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">depend</span><span class="p">(</span><span class="nx">onSuccess</span><span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">value</span><span class="p">),</span>
             <span class="kd">function</span><span class="p">(</span><span class="nx">newValue</span><span class="p">)</span> <span class="p">{</span>
               <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newValue</span><span class="p">);</span>
               <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
             <span class="p">},</span>
             <span class="kd">function</span><span class="p">(</span><span class="nx">newError</span><span class="p">)</span> <span class="p">{</span>
               <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newError</span><span class="p">);</span>
               <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
             <span class="p">});</span>
    <span class="p">}</span> <span class="k">else</span> <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"rejected"</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">depend</span><span class="p">(</span><span class="nx">onFailure</span><span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">value</span><span class="p">),</span>
             <span class="kd">function</span><span class="p">(</span><span class="nx">newValue</span><span class="p">)</span> <span class="p">{</span>
               <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newValue</span><span class="p">);</span>
               <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
             <span class="p">},</span>
             <span class="kd">function</span><span class="p">(</span><span class="nx">newError</span><span class="p">)</span> <span class="p">{</span>
               <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">newError</span><span class="p">);</span>
               <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
             <span class="p">});</span>
    <span class="p">}</span>
  <span class="p">}</span>

  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>And finally, we need a way of putting errors in promises. For this we
need a <code>reject</code> function.:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">reject</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">error</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">!==</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">throw</span> <span class="k">new</span> <span class="nb">Error</span><span class="p">(</span><span class="s2">"Trying to reject a non-pending promise!"</span><span class="p">);</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">=</span> <span class="s2">"rejected"</span><span class="p">;</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">value</span> <span class="o">=</span> <span class="nx">error</span><span class="p">;</span>
    <span class="kd">var</span> <span class="nx">dependencies</span> <span class="o">=</span> <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span><span class="p">;</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span> <span class="o">=</span> <span class="p">[];</span>
    <span class="nx">dependencies</span><span class="p">.</span><span class="nx">forEach</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">pattern</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">pattern</span><span class="p">.</span><span class="nx">rejected</span><span class="p">(</span><span class="nx">error</span><span class="p">);</span>
    <span class="p">});</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>We also need to review the <code>fulfil</code> function slightly due to our change
to the <code>dependencies</code> field:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">fulfil</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">if</span> <span class="p">(</span><span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">!==</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">throw</span> <span class="k">new</span> <span class="nb">Error</span><span class="p">(</span><span class="s2">"Trying to fulfil a non-pending promise!"</span><span class="p">);</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">state</span> <span class="o">=</span> <span class="s2">"fulfilled"</span><span class="p">;</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">value</span> <span class="o">=</span> <span class="nx">value</span><span class="p">;</span>
    <span class="kd">var</span> <span class="nx">dependencies</span> <span class="o">=</span> <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span><span class="p">;</span>
    <span class="nx">promise</span><span class="p">.</span><span class="nx">dependencies</span> <span class="o">=</span> <span class="p">[];</span>
    <span class="nx">dependencies</span><span class="p">.</span><span class="nx">forEach</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">pattern</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">pattern</span><span class="p">.</span><span class="nx">fulfilled</span><span class="p">(</span><span class="nx">value</span><span class="p">);</span>
    <span class="p">});</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>And with these new additions, we’re ready to start putting computations
that may fail in our promises:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="c1">// A computation that may fail</span>
<span class="kd">var</span> <span class="nx">div</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">b</span> <span class="o">===</span> <span class="mi">0</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="k">new</span> <span class="nb">Error</span><span class="p">(</span><span class="s2">"Division By 0"</span><span class="p">));</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">a</span> <span class="o">/</span> <span class="nx">b</span><span class="p">);</span>
  <span class="p">}</span>

  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>

<span class="kd">var</span> <span class="nx">printFailure</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">error</span><span class="p">)</span> <span class="p">{</span>
  <span class="nx">console</span><span class="p">.</span><span class="nx">error</span><span class="p">(</span><span class="nx">error</span><span class="p">);</span>
<span class="p">};</span>

<span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="mi">1</span><span class="p">,</span> <span class="nx">b</span> <span class="o">=</span> <span class="mi">2</span><span class="p">,</span> <span class="nx">c</span> <span class="o">=</span> <span class="mi">0</span><span class="p">,</span> <span class="nx">d</span> <span class="o">=</span> <span class="mi">3</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">xPromise</span> <span class="o">=</span> <span class="nx">div</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">yPromise</span> <span class="o">=</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">xPromise</span><span class="p">,</span>
                      <span class="kd">function</span><span class="p">(</span><span class="nx">x</span><span class="p">)</span> <span class="p">{</span>
                        <span class="k">return</span> <span class="nx">div</span><span class="p">(</span><span class="nx">x</span><span class="p">,</span> <span class="nx">c</span><span class="p">)</span>
                      <span class="p">},</span>
                      <span class="nx">printFailure</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">zPromise</span> <span class="o">=</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">yPromise</span><span class="p">,</span>
                      <span class="kd">function</span><span class="p">(</span><span class="nx">y</span><span class="p">)</span> <span class="p">{</span>
                        <span class="k">return</span> <span class="nx">div</span><span class="p">(</span><span class="nx">y</span><span class="p">,</span> <span class="nx">d</span><span class="p">)</span>
                      <span class="p">},</span>
                      <span class="nx">printFailure</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<h3 id="failure-propagation-with-promises">4.2. Failure Propagation With Promises</h3>

<p>The last code example will never execute <code>zPromise</code>, because <code>c</code> is 0,
and it causes the computation <code>div(x, c)</code> to fail. This is exactly what
we expect, but right now we need to pass the failure branch every time
we define a computation in our promise. Ideally, we’d like to only
define the failure branches where necessary, like we do with <code>try/catch</code>
for synchronous computations.</p>

<p>Turns out it’s trivial for our promise to support this
functionality. It’s only necessary to define our branches for success
and failure all the time if we can’t abstract over it, and it’s often
the case with control flow. For example, in JavaScript, it’s not
possible to abstract over an <code>if</code> statement, or a <code>for</code> statement,
because they’re second-class control flow mechanisms, and you can’t modify those,
pass them around, or store them in variables. Our promises are
first-class objects, they have a concrete representation of failures and
successes, which we can inspect and react to whenever we want, not just
at the point they are created.</p>

<p class="pull-right"><img src="/files/2015/09/promises-12.png" alt="">
<em>Possible lifecycle of a promise chain</em></p>

<p>In order to be able to achieve something similar to <code>try/catch</code> we first
must be able to do two things with our representation of successes and
failures:</p>

<ul>
  <li>
    <p><strong>recover from a failure</strong>: If a computation failed, I must be able to
turn that value into some sort of success that makes sense. This
allows, for example, the use of a default value when retrieving some
data from a <code>Map</code> or <code>Array</code> structure. <code>map.get("foo").recover(1) +
2</code> would give you <code>3</code> if there’s no <code>"foo"</code> key in the map.</p>
  </li>
  <li>
    <p><strong>fail anytime</strong>: If I have a successful computation, I must be able
to turn that value into a failure, and if I have a failure, I must be
able to keep the failure. The former allows short-circuiting a
computation, and the latter allows failure propagation. With both,
you’re able to capture the semantics of <code>(a / b) / (c / d)</code> failing
entirely if any subexpression fails.</p>
  </li>
</ul>

<p>Luckily for us, the <code>depend</code> function already does most of this
work. Because <code>depend</code> requires its expressions to return <em>whole</em>
promises it’s able to propagate not only the values, but the state the
promise is in. This is important since if we define just a <code>successful</code>
branch, and the promise fails, we want to propagate not only the value,
but also its failure state.</p>

<p>With these mechanisms already in place, supporting simple failure
propagation, error handling, and short-circuiting on failures requires
adding two operations: <code>chain</code>, which creates a dependency on the
successful value of a promise, but short-circuits on failures; and
<code>recover</code>, which creates a dependency on the failure value of a promise,
and allows recovering from that error.</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">expression</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">return</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">expression</span><span class="p">,</span>
                <span class="kd">function</span><span class="p">(</span><span class="nx">error</span><span class="p">)</span> <span class="p">{</span>
                  <span class="c1">// We propagate the state and</span>
                  <span class="c1">// value of the error by just</span>
                  <span class="c1">// creating an equivalent promise</span>
                  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
                  <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">error</span><span class="p">);</span>
                  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
                <span class="p">})</span>
<span class="p">}</span>

<span class="kd">function</span> <span class="nx">recover</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">expression</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">return</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span>
                <span class="kd">function</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
                  <span class="c1">// We propagate successful values</span>
                  <span class="c1">// by just creating an equivalent</span>
                  <span class="c1">// promise.</span>
                  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
                  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">value</span><span class="p">);</span>
                  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
                <span class="p">},</span>
                <span class="nx">expression</span><span class="p">)</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>We can then use these two functions to simplify our previous division
example:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3
4
5
6
7
8
9</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="mi">1</span><span class="p">,</span> <span class="nx">b</span> <span class="o">=</span> <span class="mi">2</span><span class="p">,</span> <span class="nx">c</span> <span class="o">=</span> <span class="mi">0</span><span class="p">,</span> <span class="nx">d</span> <span class="o">=</span> <span class="mi">3</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">xPromise</span> <span class="o">=</span> <span class="nx">div</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">yPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">xPromise</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">x</span><span class="p">)</span> <span class="p">{</span>
                                 <span class="k">return</span> <span class="nx">div</span><span class="p">(</span><span class="nx">x</span><span class="p">,</span> <span class="nx">c</span><span class="p">)</span>
                               <span class="p">});</span>
<span class="kd">var</span> <span class="nx">zPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">yPromise</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">y</span><span class="p">)</span> <span class="p">{</span>
                                 <span class="k">return</span> <span class="nx">div</span><span class="p">(</span><span class="nx">y</span><span class="p">,</span> <span class="nx">d</span><span class="p">);</span>
                               <span class="p">});</span>
<span class="kd">var</span> <span class="nx">resultPromise</span> <span class="o">=</span> <span class="nx">recover</span><span class="p">(</span><span class="nx">zPromise</span><span class="p">,</span> <span class="nx">printFailure</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<h2 id="combining-promises">5. Combining Promises</h2>

<h3 id="combining-promises-deterministically">5.1. Combining Promises Deterministically</h3>

<p>While sequencing operations with promises requires one to create a chain
of dependencies, combining promises concurrently just requires that the
promises don’t have a dependency on each other.</p>

<p>For our Circle example we have a computation that is naturally
concurrent. The <code>radius</code> expression and the <code>Math.PI</code> expression don’t
depend on each other, so they can be computed separately, but
<code>circleArea</code> depends on both. In terms of code, we have the following:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">radius</span> <span class="o">=</span> <span class="mi">10</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">circleArea</span> <span class="o">=</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nb">Math</span><span class="p">.</span><span class="nx">PI</span><span class="p">;</span>
<span class="nx">print</span><span class="p">(</span><span class="nx">circleArea</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>If one wanted to express this with promises, they’d have:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">circleAreaAbstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">radius</span><span class="p">,</span> <span class="nx">pi</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">pi</span><span class="p">);</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">};</span>

<span class="kd">var</span> <span class="nx">printAbstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">circleArea</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">print</span><span class="p">(</span><span class="nx">circleArea</span><span class="p">));</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">};</span>

<span class="kd">var</span> <span class="nx">radiusPromise</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
<span class="kd">var</span> <span class="nx">piPromise</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

<span class="kd">var</span> <span class="nx">circleAreaPromise</span> <span class="o">=</span> <span class="o">???</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">printPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">circleAreaPromise</span><span class="p">,</span> <span class="nx">printAbstraction</span><span class="p">);</span>

<span class="nx">fulfil</span><span class="p">(</span><span class="nx">radiusPromise</span><span class="p">,</span> <span class="mi">10</span><span class="p">);</span>
<span class="nx">fulfil</span><span class="p">(</span><span class="nx">piPromise</span><span class="p">,</span> <span class="nb">Math</span><span class="p">.</span><span class="nx">PI</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>We have a small problem here: <code>circleAreaAbstraction</code> is an expression
that depends on <strong>two</strong> values, but <code>depend</code> is only able to define
dependencies for expressions that depend on a single value!</p>

<p>There are a few ways of working around this limitation, we’ll start with
the simple one. If <code>depend</code> can provide a single value for one
expression, then it must be possible to capture the value in a closure,
and extract the values from the promises one at a time. This does create
some implicit ordering, but it shouldn’t impact concurrency too much.</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">wait2</span><span class="p">(</span><span class="nx">promiseA</span><span class="p">,</span> <span class="nx">promiseB</span><span class="p">,</span> <span class="nx">expression</span><span class="p">)</span> <span class="p">{</span>
  <span class="c1">// We extract the value from promiseA first.</span>
  <span class="k">return</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">promiseA</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">a</span><span class="p">)</span> <span class="p">{</span>
    <span class="c1">// Then we extract the value of promiseB</span>
    <span class="k">return</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">promiseB</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">b</span><span class="p">)</span> <span class="p">{</span>
      <span class="c1">// Now that we've got access to both values,</span>
      <span class="c1">// we can execute the expression that depends</span>
      <span class="c1">// on more than one value:</span>
      <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
      <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">expression</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">));</span>
      <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
    <span class="p">})</span>
  <span class="p">})</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>With this, we can define <code>circleAreaPromise</code> as the following:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">circleAreaPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">wait2</span><span class="p">(</span><span class="nx">radiusPromise</span><span class="p">,</span> <span class="nx">piPromise</span><span class="p">),</span>
                              <span class="nx">circleAreaAbstraction</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>We could define <code>wait3</code> for expressions that depend on three values,
<code>wait4</code> for expressions that depend on four values, and so on, and so
forth. But <code>wait*</code> creates an implicit ordering (promises are executed
in a particular order), and it requires that we know the amount of
values that we’re going to plug in advance. So it doesn’t work if we
want to wait for an entire array of promises, for example (although one
could combine <code>wait2</code> and <code>Array.prototype.reduce</code> for that).</p>

<p>Another way of solving this problem is to accept an array of promises,
and execute each one as soon as possible, then give back a promise for
an array of the values the original promises contained. This approach is
a little more complicated, since we need to implement a simple Finite
State Machine, but there is no implicit ordering (besides JavaScript’s
own execution semantics).</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">waitAll</span><span class="p">(</span><span class="nx">promises</span><span class="p">,</span> <span class="nx">expression</span><span class="p">)</span> <span class="p">{</span>
  <span class="c1">// An array of the values of the promise, which we'll fill in</span>
  <span class="c1">// incrementally.</span>
  <span class="kd">var</span> <span class="nx">values</span> <span class="o">=</span> <span class="k">new</span> <span class="nb">Array</span><span class="p">(</span><span class="nx">promises</span><span class="p">.</span><span class="nx">length</span><span class="p">);</span>
  <span class="c1">// How many promises we're still waiting for</span>
  <span class="kd">var</span> <span class="nx">pending</span> <span class="o">=</span> <span class="nx">values</span><span class="p">.</span><span class="nx">length</span><span class="p">;</span>
  <span class="c1">// The resulting promise</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="c1">// Whether the promise has been resolved or not</span>
  <span class="kd">var</span> <span class="nx">resolved</span> <span class="o">=</span> <span class="kc">false</span><span class="p">;</span>

  <span class="c1">// We start by executing each promise. We keep track of the</span>
  <span class="c1">// original index so we know where to put the value in the </span>
  <span class="c1">// resulting array.</span>
  <span class="nx">promises</span><span class="p">.</span><span class="nx">forEach</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="nx">index</span><span class="p">)</span> <span class="p">{</span>
    <span class="c1">// For each promise, we'll wait for the promise to resolve,</span>
    <span class="c1">// and then store the value in the `values` array.</span>
    <span class="nx">depend</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
      <span class="k">if</span> <span class="p">(</span><span class="o">!</span><span class="nx">resolved</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">values</span><span class="p">[</span><span class="nx">index</span><span class="p">]</span> <span class="o">=</span> <span class="nx">value</span><span class="p">;</span>
        <span class="nx">pending</span> <span class="o">=</span> <span class="nx">pending</span> <span class="o">-</span> <span class="mi">1</span><span class="p">;</span>

        <span class="c1">// If we finished waiting for all of the promises, we</span>
        <span class="c1">// can put the array of values in the resulting promise</span>
        <span class="k">if</span> <span class="p">(</span><span class="nx">pending</span> <span class="o">===</span> <span class="mi">0</span><span class="p">)</span> <span class="p">{</span>
          <span class="nx">resolved</span> <span class="o">=</span> <span class="kc">true</span><span class="p">;</span>
          <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">values</span><span class="p">);</span>
        <span class="p">}</span>
      <span class="p">}</span>
      <span class="c1">// We don't care about doing anything else with this promise.</span>
      <span class="c1">// We return an empty promise because `depends` requires it.</span>
      <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
    <span class="p">},</span> <span class="kd">function</span><span class="p">(</span><span class="nx">error</span><span class="p">)</span> <span class="p">{</span>
      <span class="k">if</span> <span class="p">(</span><span class="o">!</span><span class="nx">resolved</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">resolved</span> <span class="o">=</span> <span class="kc">true</span><span class="p">;</span>
        <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">error</span><span class="p">);</span>
      <span class="p">}</span>
      <span class="k">return</span> <span class="nx">createPromise</span><span class="p">();</span>
    <span class="p">})</span>
  <span class="p">});</span>

  <span class="c1">// Finally, we return a promise for the eventual array of values</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>If we were to use <code>waitAll</code> for the <code>circleAreaAbstraction</code>, it would
look like the following:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3
4</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">circleAreaPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">waitAll</span><span class="p">([</span><span class="nx">radiusPromise</span><span class="p">,</span> <span class="nx">piPromise</span><span class="p">]),</span>
                              <span class="kd">function</span><span class="p">(</span><span class="nx">xs</span><span class="p">)</span> <span class="p">{</span>
                                <span class="k">return</span> <span class="nx">circleAreaAbstraction</span><span class="p">(</span><span class="nx">xs</span><span class="p">[</span><span class="mi">0</span><span class="p">],</span> <span class="nx">xs</span><span class="p">[</span><span class="mi">1</span><span class="p">]);</span>
                              <span class="p">})</span>
</pre></div>
</td></tr></tbody></table>

<h3 id="combining-promises-non-deterministically">5.2. Combining Promises Non-Deterministically</h3>

<p>We’ve seen how to combine promises, but so far we can only combine them
deterministically. This doesn’t help us if we need to, for example,
select the fastest of two computations. Maybe we’re searching for
something on two servers, and we don’t care which one answers, we’ll
just go with the fastest one.</p>

<p>In order to support this we’ll introduce some non-determinism. In
particular, we need an operation that, given two promises, takes the
value and state of the one which resolves the fastest. The idea behind
the operation is simple: run two promises concurrently, and wait for the
first resolution, then propagate that to the resulting promise. The
implementation is somewhat less simple, since we need to keep state
around:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">race</span><span class="p">(</span><span class="nx">left</span><span class="p">,</span> <span class="nx">right</span><span class="p">)</span> <span class="p">{</span>
  <span class="c1">// Create the resulting promise.</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

  <span class="c1">// Waits for both promises concurrently. doFulfil</span>
  <span class="c1">// and doReject will propagate the result/state of</span>
  <span class="c1">// the first promise to resolve. This is done by</span>
  <span class="c1">// checking the current state of `result` to make</span>
  <span class="c1">// sure it's already pending.</span>
  <span class="nx">depend</span><span class="p">(</span><span class="nx">left</span><span class="p">,</span> <span class="nx">doFulfil</span><span class="p">,</span> <span class="nx">doReject</span><span class="p">);</span>
  <span class="nx">depend</span><span class="p">(</span><span class="nx">right</span><span class="p">,</span> <span class="nx">doFulfil</span><span class="p">,</span> <span class="nx">doReject</span><span class="p">);</span>

  <span class="c1">// Return the resulting promise</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>

  
  <span class="kd">function</span> <span class="nx">doFulfil</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">if</span> <span class="p">(</span><span class="nx">result</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">value</span><span class="p">);</span>
    <span class="p">}</span>
  <span class="p">}</span>

  <span class="kd">function</span> <span class="nx">doReject</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">if</span> <span class="p">(</span><span class="nx">result</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">value</span><span class="p">);</span>
    <span class="p">}</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>With this we can start combining operations by choosing between them
non-deterministically. If we take the previous example:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">searchA</span><span class="p">()</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">setTimeout</span><span class="p">(</span><span class="kd">function</span><span class="p">()</span> <span class="p">{</span>
    <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="mi">10</span><span class="p">);</span>
  <span class="p">},</span> <span class="mi">300</span><span class="p">);</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>

<span class="kd">function</span> <span class="nx">searchA</span><span class="p">()</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">setTimeout</span><span class="p">(</span><span class="kd">function</span><span class="p">()</span> <span class="p">{</span>
    <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="mi">30</span><span class="p">);</span>
  <span class="p">},</span> <span class="mi">200</span><span class="p">);</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>

<span class="kd">var</span> <span class="nx">valuePromise</span> <span class="o">=</span> <span class="nx">race</span><span class="p">(</span><span class="nx">searchA</span><span class="p">(),</span> <span class="nx">searchB</span><span class="p">());</span>
<span class="c1">// =&gt; valuePromise will eventually be 30</span>
</pre></div>
</td></tr></tbody></table>

<p>Choosing between more than two promises is possible, because <code>race(a,
b)</code> basically <em>becomes</em> <code>a</code> or <code>b</code> depending on which one resolves the
fastest. So if we have <code>race(c, race(a, b))</code>, and <code>b</code> resolves first,
then that’s the same as <code>race(c, b)</code>. Of course, typing <code>race(a, race(b,
race(c, ...)))</code> isn’t the best thing, so we can write a simple
combinator to do that for us:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">raceAll</span><span class="p">(</span><span class="nx">promises</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">return</span> <span class="nx">promises</span><span class="p">.</span><span class="nx">reduce</span><span class="p">(</span><span class="nx">race</span><span class="p">,</span> <span class="nx">createPromise</span><span class="p">());</span>
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>And then we can use it:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="nx">raceAll</span><span class="p">([</span><span class="nx">searchA</span><span class="p">(),</span> <span class="nx">searchB</span><span class="p">(),</span> <span class="nx">waitAll</span><span class="p">([</span><span class="nx">searchA</span><span class="p">(),</span> <span class="nx">searchB</span><span class="p">()])]);</span>
</pre></div>
</td></tr></tbody></table>

<p>Another way of choosing between two promises non-deterministically is to
wait for the first one to be <em>successfully fulfilled</em>. For example, if
you’re trying to find a valid download link in a list of mirrors, you
don’t want to fail if the first one fails, you want to download from the
first mirror you can, and fail if all of them fail. We can
write an <code>attempt</code> operation to capture this:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">attempt</span><span class="p">(</span><span class="nx">left</span><span class="p">,</span> <span class="nx">right</span><span class="p">)</span> <span class="p">{</span>
  <span class="c1">// Creates the resulting promise.</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

  <span class="c1">// doFulfil will propagate the result/state of the first</span>
  <span class="c1">// promise that resolves successfully, whereas doReject</span>
  <span class="c1">// will aggregate the errors until all of the promises</span>
  <span class="c1">// fail.</span>
  <span class="c1">//</span>
  <span class="c1">// We need to keep track of the errors that happened</span>
  <span class="kd">var</span> <span class="nx">errors</span> <span class="o">=</span> <span class="p">{}</span>

  <span class="c1">// Now we can wait for both promises, just like in `race`.</span>
  <span class="c1">// The difference here is that `doReject` needs to know</span>
  <span class="c1">// which promise it is rejecting, to keep track of the</span>
  <span class="c1">// errors.</span>
  <span class="nx">depend</span><span class="p">(</span><span class="nx">left</span><span class="p">,</span> <span class="nx">doFulfil</span><span class="p">,</span> <span class="nx">doReject</span><span class="p">(</span><span class="s1">'left'</span><span class="p">));</span>
  <span class="nx">depend</span><span class="p">(</span><span class="nx">right</span><span class="p">,</span> <span class="nx">doFulfil</span><span class="p">,</span> <span class="nx">doReject</span><span class="p">(</span><span class="s1">'right'</span><span class="p">));</span>

  <span class="c1">// Finally, return the resulting promise.</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>

  <span class="kd">function</span> <span class="nx">doFulfil</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">if</span> <span class="p">(</span><span class="nx">result</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
      <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">state</span><span class="p">);</span>
    <span class="p">}</span>
  <span class="p">}</span>

  <span class="kd">function</span> <span class="nx">doReject</span><span class="p">(</span><span class="nx">field</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">return</span> <span class="kd">function</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
      <span class="k">if</span> <span class="p">(</span><span class="nx">result</span><span class="p">.</span><span class="nx">state</span> <span class="o">===</span> <span class="s2">"pending"</span><span class="p">)</span> <span class="p">{</span>
        <span class="c1">// If we're still pending, we can safely keep aggregating</span>
        <span class="c1">// the errors. We make sure the error we got goes into the</span>
        <span class="c1">// right field of the object aggregating these errors</span>
        <span class="nx">errors</span><span class="p">[</span><span class="nx">field</span><span class="p">]</span> <span class="o">=</span> <span class="nx">value</span><span class="p">;</span>

        <span class="c1">// If we've managed to catch all of the errors, we can</span>
        <span class="c1">// reject the resulting promise. We reject it with all</span>
        <span class="c1">// of the errors that happened, in the right order.</span>
        <span class="k">if</span> <span class="p">(</span><span class="s1">'left'</span> <span class="k">in</span> <span class="nx">errors</span> <span class="o">&amp;&amp;</span> <span class="s1">'right'</span> <span class="k">in</span> <span class="nx">errors</span><span class="p">)</span> <span class="p">{</span>
          <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="p">[</span><span class="nx">errors</span><span class="p">.</span><span class="nx">left</span><span class="p">,</span> <span class="nx">errors</span><span class="p">.</span><span class="nx">right</span><span class="p">]);</span>
        <span class="p">}</span>
      <span class="p">}</span>
    <span class="p">}</span>
  <span class="p">}</span>  
<span class="p">}</span>
</pre></div>
</td></tr></tbody></table>

<p>Usage is the same as <code>race</code>, so <code>attempt(searchA(), searchB())</code> would
return the first promise that resolves successfully, rather than just
the first promise to resolve. However, unlike <code>race</code>, <code>attempt</code> doesn’t
compose naturally because it aggregates the errors. So, if we want to
attempt several promises, we need to account for that:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">function</span> <span class="nx">attemptAll</span><span class="p">(</span><span class="nx">promises</span><span class="p">)</span> <span class="p">{</span>
  <span class="c1">// Since we aggregate all promises, we need to start from a</span>
  <span class="c1">// rejected one, otherwise attempt would never finish if we</span>
  <span class="c1">// have errors.</span>
  <span class="kd">var</span> <span class="nx">initial</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">reject</span><span class="p">(</span><span class="nx">initial</span><span class="p">,</span> <span class="p">[]);</span>

  <span class="c1">// Finally, we use `attempt` to combine the promises, taking</span>
  <span class="c1">// care of flattening the arrays of errors at each step:</span>
  <span class="k">return</span> <span class="nx">promises</span><span class="p">.</span><span class="nx">reduce</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">promise</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">return</span> <span class="nx">recover</span><span class="p">(</span><span class="nx">attempt</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">promise</span><span class="p">),</span> <span class="kd">function</span><span class="p">(</span><span class="nx">errors</span><span class="p">)</span> <span class="p">{</span>
      <span class="k">return</span> <span class="nx">errors</span><span class="p">[</span><span class="mi">0</span><span class="p">].</span><span class="nx">concat</span><span class="p">([</span><span class="nx">errors</span><span class="p">[</span><span class="mi">1</span><span class="p">]]);</span>
    <span class="p">});</span>
  <span class="p">},</span> <span class="nx">createPromise</span><span class="p">());</span>
<span class="p">}</span>

<span class="nx">attemptAll</span><span class="p">([</span><span class="nx">searchA</span><span class="p">(),</span> <span class="nx">searchB</span><span class="p">(),</span> <span class="nx">searchC</span><span class="p">(),</span> <span class="nx">searchD</span><span class="p">()]);</span>
</pre></div>
</td></tr></tbody></table>

<h2 id="a-practical-understanding-of-promises">6. A Practical Understanding of Promises</h2>

<p><a href="http://www.ecma-international.org/ecma-262/6.0/">ECMAScript 2015</a>
defines the concept of Promises for JavaScript, but up until now we’ve
been using a very simple, but unconventional implementation of
promises. The reason for this is that ECMAScript’s standard promise is
too complex, and it would make it harder to explain the concepts from
the ground up. However, now that you know what promises are, and how
each aspect of them can be implemented, it’s very trivial to make the
move to the standard promises.</p>

<h3 id="introducing-ecmascript-promises">6.1. Introducing ECMAScript Promises</h3>

<p>The new version of the ECMAScript language defines a
<a href="http://www.ecma-international.org/ecma-262/6.0/#sec-promise-constructor">standard for promises</a>
in JavaScript. This standard differs from the minimal promise
implementation we’ve introduced in a few ways, which makes it more
complex, but also more practical and easier to use. The table below
lists the differences between each implementation:</p>

<table class="common-table simple-inline-code">
  <thead>
    <tr>
      <th>Our Promises</th>
      <th>ES2015 Promises</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>p = createPromise()</code></td>
      <td><code>p = new Promise(...)</code></td>
    </tr>
    <tr>
      <td><code>fulfil(p, x)</code></td>
      <td><code>p = new Promise((fulfil, reject) =&gt; fulfil(x))</code></td>
    </tr>
    <tr>
      <td><span class="up"></span></td>
      <td><code>p = Promise.resolve(x)</code></td>
    </tr>
    <tr>
      <td><code>reject(p, x)</code></td>
      <td><code>p = new Promise((fulfil, reject) =&gt; reject(x))</code></td>
    </tr>
    <tr>
      <td><span class="up"></span></td>
      <td><code>p = Promise.reject(x)</code></td>
    </tr>
    <tr>
      <td><code>depend(p, f, g)</code></td>
      <td><code>p.then(f, g)</code></td>
    </tr>
    <tr>
      <td><code>chain(p, f)</code></td>
      <td><code>p.then(f)</code></td>
    </tr>
    <tr>
      <td><code>recover(p, g)</code></td>
      <td><code>p.catch(g)</code></td>
    </tr>
    <tr>
      <td><code>waitAll(ps)</code></td>
      <td><code>Promise.all(ps)</code></td>
    </tr>
    <tr>
      <td><code>raceAll(ps)</code></td>
      <td><code>Promise.race(ps)</code></td>
    </tr>
    <tr>
      <td><code>attemptAll(ps)</code></td>
      <td>(None)</td>
    </tr>
  </tbody>
</table>

<p>The main methods in the standard promise are <code>new Promise(...)</code>, which
introduce a promise object, and <code>.then(...)</code> which transforms it. There
are a few differences in the way they work, when compared to the
operations described so far.</p>

<p><code>new Promise(f)</code> introduces a new promise object, it does so by taking a
computation which eventually either succeeds or fails with a particular
value. The act of succeeding and failing is captured by the two function
arguments passed to the function <code>f</code>, which it expects. Thus:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">p</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
<span class="nx">fulfil</span><span class="p">(</span><span class="nx">p</span><span class="p">,</span> <span class="mi">10</span><span class="p">);</span>

<span class="c1">// Becomes:</span>
<span class="kd">var</span> <span class="nx">p</span> <span class="o">=</span> <span class="k">new</span> <span class="nx">Promise</span><span class="p">((</span><span class="nx">fulfil</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="o">=&gt;</span> <span class="nx">fulfil</span><span class="p">(</span><span class="mi">10</span><span class="p">));</span>


<span class="c1">// ---</span>
<span class="c1">// And:</span>
<span class="kd">var</span> <span class="nx">q</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
<span class="nx">reject</span><span class="p">(</span><span class="nx">q</span><span class="p">,</span> <span class="mi">20</span><span class="p">);</span>

<span class="c1">// Becomes:</span>
<span class="kd">var</span> <span class="nx">p</span> <span class="o">=</span> <span class="k">new</span> <span class="nx">Promise</span><span class="p">((</span><span class="nx">fulfil</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="o">=&gt;</span> <span class="nx">reject</span><span class="p">(</span><span class="mi">20</span><span class="p">));</span>
</pre></div>
</td></tr></tbody></table>

<p><code>promise.then(f, g)</code> is an operation that creates a dependency between
an expression with a hole for a value, and the value in the promise,
similar to the <code>depend</code> operation. Both <code>f</code> and <code>g</code> are optional
arguments, if they aren’t provided the promise will propagate the value
in that state.</p>

<p>Unlike our <code>depend</code>, <code>.then</code> is a complex operation, which tries to make
using promises easier. The function arguments passed to <code>.then</code> can
return either a promise, or a regular value, in which case the operation
takes care of automatically putting them into a promise for you. Thus:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="nx">depend</span><span class="p">(</span><span class="nx">promise</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">value</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">q</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">q</span><span class="p">,</span> <span class="nx">value</span> <span class="o">+</span> <span class="mi">1</span><span class="p">);</span>
  <span class="k">return</span> <span class="nx">q</span><span class="p">;</span>
<span class="p">})</span>


<span class="c1">// ---</span>
<span class="c1">// Becomes:</span>
<span class="nx">promise</span><span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="nx">value</span> <span class="o">=&gt;</span> <span class="nx">value</span> <span class="o">+</span> <span class="mi">1</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>These allow the code using promises to be concise and easier to read,
compared to our previous formulation:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">squareAreaAbstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">side</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">side</span> <span class="o">*</span> <span class="nx">side</span><span class="p">);</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">};</span>
<span class="kd">var</span> <span class="nx">printAbstraction</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">squareArea</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
  <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">print</span><span class="p">(</span><span class="nx">squareArea</span><span class="p">));</span>
  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>

<span class="kd">var</span> <span class="nx">sidePromise</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>
<span class="kd">var</span> <span class="nx">squareAreaPromise</span> <span class="o">=</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">sidePromise</span><span class="p">,</span> <span class="nx">squareAreaAbstraction</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">printPromise</span> <span class="o">=</span> <span class="nx">depend</span><span class="p">(</span><span class="nx">squareAreaPromise</span><span class="p">,</span> <span class="nx">printAbstraction</span><span class="p">);</span>

<span class="nx">fulfil</span><span class="p">(</span><span class="nx">sidePromise</span><span class="p">,</span> <span class="mi">10</span><span class="p">);</span>


<span class="c1">// ---</span>
<span class="c1">// Becomes</span>
<span class="kd">var</span> <span class="nx">sideP</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">10</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">squareAreaP</span> <span class="o">=</span> <span class="nx">sideP</span><span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="nx">side</span> <span class="o">=&gt;</span> <span class="nx">side</span> <span class="o">*</span> <span class="nx">side</span><span class="p">);</span>
<span class="nx">squareAreaP</span><span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="nx">area</span> <span class="o">=&gt;</span> <span class="nx">print</span><span class="p">(</span><span class="nx">area</span><span class="p">));</span>

<span class="c1">// Which is more akin to the synchronous version:</span>
<span class="kd">var</span> <span class="nx">side</span> <span class="o">=</span> <span class="mi">10</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">squareArea</span> <span class="o">=</span> <span class="nx">side</span> <span class="o">*</span> <span class="nx">side</span><span class="p">;</span>
<span class="nx">print</span><span class="p">(</span><span class="nx">squareArea</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<p>Depending on multiple values concurrently is handled by the
<code>Promise.all</code> operation, which is similar to our <code>waitAll</code> operation:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">radius</span> <span class="o">=</span> <span class="mi">10</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">pi</span> <span class="o">=</span> <span class="nb">Math</span><span class="p">.</span><span class="nx">PI</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">circleArea</span> <span class="o">=</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">pi</span><span class="p">;</span>
<span class="nx">print</span><span class="p">(</span><span class="nx">circleArea</span><span class="p">);</span>


<span class="c1">// ---</span>
<span class="c1">// Becomes:</span>
<span class="kd">var</span> <span class="nx">radiusP</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">10</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">piP</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nb">Math</span><span class="p">.</span><span class="nx">PI</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">circleAreaP</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">all</span><span class="p">([</span><span class="nx">radiusP</span><span class="p">,</span> <span class="nx">piP</span><span class="p">])</span>
                         <span class="p">.</span><span class="nx">then</span><span class="p">(([</span><span class="nx">radius</span><span class="p">,</span> <span class="nx">pi</span><span class="p">])</span> <span class="o">=&gt;</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">radius</span> <span class="o">*</span> <span class="nx">pi</span><span class="p">);</span>
<span class="nx">circleAreaP</span><span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="nx">circleArea</span> <span class="o">=&gt;</span> <span class="nx">print</span><span class="p">(</span><span class="nx">circleArea</span><span class="p">));</span>
</pre></div>
</td></tr></tbody></table>

<p>Error and success propagation is handled by the <code>.then</code> operation
itself, and the <code>.catch</code> operation is provided as a concise way of
invoking <code>.then</code> without defining a success branch:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js"> 1
 2
 3
 4
 5
 6
 7
 8
 9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">div</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">result</span> <span class="o">=</span> <span class="nx">createPromise</span><span class="p">();</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">b</span> <span class="o">===</span> <span class="mi">0</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">reject</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="k">new</span> <span class="nb">Error</span><span class="p">(</span><span class="s2">"Division By 0"</span><span class="p">));</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="nx">fulfil</span><span class="p">(</span><span class="nx">result</span><span class="p">,</span> <span class="nx">a</span> <span class="o">/</span> <span class="nx">b</span><span class="p">);</span>
  <span class="p">}</span>

  <span class="k">return</span> <span class="nx">result</span><span class="p">;</span>
<span class="p">}</span>

<span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="mi">1</span><span class="p">,</span> <span class="nx">b</span> <span class="o">=</span> <span class="mi">2</span><span class="p">,</span> <span class="nx">c</span> <span class="o">=</span> <span class="mi">0</span><span class="p">,</span> <span class="nx">d</span> <span class="o">=</span> <span class="mi">3</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">xPromise</span> <span class="o">=</span> <span class="nx">div</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">yPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">xPromise</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">x</span><span class="p">)</span> <span class="p">{</span>
                                 <span class="k">return</span> <span class="nx">div</span><span class="p">(</span><span class="nx">x</span><span class="p">,</span> <span class="nx">c</span><span class="p">)</span>
                               <span class="p">});</span>
<span class="kd">var</span> <span class="nx">zPromise</span> <span class="o">=</span> <span class="nx">chain</span><span class="p">(</span><span class="nx">yPromise</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">y</span><span class="p">)</span> <span class="p">{</span>
                                 <span class="k">return</span> <span class="nx">div</span><span class="p">(</span><span class="nx">y</span><span class="p">,</span> <span class="nx">d</span><span class="p">);</span>
                               <span class="p">});</span>
<span class="kd">var</span> <span class="nx">resultPromise</span> <span class="o">=</span> <span class="nx">recover</span><span class="p">(</span><span class="nx">zPromise</span><span class="p">,</span> <span class="nx">printFailure</span><span class="p">);</span>


<span class="c1">// ---</span>
<span class="c1">// Becomes:</span>
<span class="kd">var</span> <span class="nx">div</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">return</span> <span class="k">new</span> <span class="nx">Promise</span><span class="p">((</span><span class="nx">fulfil</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="o">=&gt;</span> <span class="p">{</span>
    <span class="k">if</span> <span class="p">(</span><span class="nx">b</span> <span class="o">===</span> <span class="mi">0</span><span class="p">)</span>  <span class="nx">reject</span><span class="p">(</span><span class="k">new</span> <span class="nb">Error</span><span class="p">(</span><span class="s2">"Division by 0"</span><span class="p">));</span>
    <span class="k">else</span>          <span class="nx">fulfil</span><span class="p">(</span><span class="nx">a</span> <span class="o">/</span> <span class="nx">b</span><span class="p">);</span>
  <span class="p">})</span>
<span class="p">}</span>

<span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="mi">1</span><span class="p">,</span> <span class="nx">b</span> <span class="o">=</span> <span class="mi">2</span><span class="p">,</span> <span class="nx">c</span> <span class="o">=</span> <span class="mi">0</span><span class="p">,</span> <span class="nx">d</span> <span class="o">=</span> <span class="mi">3</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">xP</span> <span class="o">=</span> <span class="nx">div</span><span class="p">(</span><span class="nx">a</span><span class="p">,</span> <span class="nx">b</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">yP</span> <span class="o">=</span> <span class="nx">xP</span><span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="nx">div</span><span class="p">(</span><span class="nx">x</span><span class="p">,</span> <span class="nx">c</span><span class="p">));</span>
<span class="kd">var</span> <span class="nx">zP</span> <span class="o">=</span> <span class="nx">yP</span><span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="nx">y</span> <span class="o">=&gt;</span> <span class="nx">div</span><span class="p">(</span><span class="nx">y</span><span class="p">,</span> <span class="nx">d</span><span class="p">));</span>
<span class="kd">var</span> <span class="nx">resultP</span> <span class="o">=</span> <span class="nx">zP</span><span class="p">.</span><span class="k">catch</span><span class="p">(</span><span class="nx">printFailure</span><span class="p">);</span>
</pre></div>
</td></tr></tbody></table>

<h3 id="a-closer-look-into-then">6.2. A Closer Look Into <code>.then</code></h3>

<p>There are a few things that make the <code>.then</code> method different from our
previous <code>depend</code> function. While <code>.then</code> is one method to define
dependency relationships between eventual values and some computation,
it also tries to make the usage of the method easy for the majority of
cases. This makes <code>.then</code> a complex method<sup id="fnref:5"><a href="#fn:5" class="footnote">5</a></sup>, but we can understand it
by relating our previous machinery to this new method.</p>

<h4><code>.then</code> automatically lifts regular values</h4>

<p>Our <code>depend</code> function worked in the domain of promises. It expected
its dependent computation to return a promise in order to return a
promise itself. <code>.then</code> doesn’t have this requirement. If the
dependent computation returns a regular value, like <code>42</code>, <code>.then</code> will
convert that value to a promise containing the value. In essence,
<code>.then</code> lifts regular values into the domain of promises, as needed.</p>

<p>Compare the simplified types of our <code>depend</code> function:</p>

<div class="highlight"><pre><code class="language-ocaml" data-lang="ocaml"><span class="n">depend</span> <span class="o">:</span> <span class="o">(</span><span class="nc">Promise</span> <span class="k">of</span> <span class="err">α</span><span class="o">,</span> <span class="o">(</span><span class="err">α</span> <span class="o">-&gt;</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">β</span><span class="o">))</span> <span class="o">-&gt;</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">β</span></code></pre></div>

<p>With the simplified types of the <code>.then</code> method:</p>

<div class="highlight"><pre><code class="language-ocaml" data-lang="ocaml"><span class="n">promise</span><span class="o">.</span><span class="k">then</span> <span class="o">:</span> <span class="o">(</span><span class="n">this</span><span class="o">:</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">α</span><span class="o">,</span> <span class="o">(</span><span class="err">α</span> <span class="o">-&gt;</span> <span class="err">β</span><span class="o">))</span> <span class="o">-&gt;</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">β</span>
<span class="n">promise</span><span class="o">.</span><span class="k">then</span> <span class="o">:</span> <span class="o">(</span><span class="n">this</span><span class="o">:</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">α</span><span class="o">,</span> <span class="o">(</span><span class="err">α</span> <span class="o">-&gt;</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">β</span><span class="o">))</span> <span class="o">-&gt;</span> <span class="nc">Promise</span> <span class="k">of</span> <span class="err">β</span></code></pre></div>

<p>While in the <code>depend</code> function the only thing we can do is return a
promise of something (and have that same something be in the resulting
promise), the <code>.then</code> function also accepts returning a regular value,
without wrapping it in a promise, for convenience.</p>

<h4><code>.then</code> disallows nested promises</h4>

<p>Another way in which ECMAScript 2015 promises try to make usage easier
for the common use cases is by disallowing nested promises. It does so
by assimilating anything that has a <code>.then</code> method, which can be
problematic in cases where you’re not expecting assimilation<sup id="fnref:6"><a href="#fn:6" class="footnote">6</a></sup>, but
otherwise relieves one from thinking about matching the types of the
return values.</p>

<p>It’s not possible to give the <code>.then</code> method a sensible type in
non-dependent type systems because of this feature, but, roughly, this
means that the following example:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">1</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">x</span> <span class="o">+</span> <span class="mi">1</span><span class="p">)))</span>
</pre></div>
</td></tr></tbody></table>

<p>Is equivalent to:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">1</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">x</span> <span class="o">+</span> <span class="mi">1</span><span class="p">))</span>
</pre></div>
</td></tr></tbody></table>

<p>This is also enforced with <code>Promise.resolve</code>, but not with
<code>Promise.reject</code>.</p>

<h4><code>.then</code> reifies exceptions</h4>

<p>If an exception happens synchronously during the evaluation of a
dependent computation attached through the <code>.then</code> method, that
exception will be caught and reified as a rejected promise. In essence,
this means that all of the computations attached to a promise’s values
through the <code>.then</code> method should be treated as if implicitly wrapped in
a <code>try/catch</code> block, such that:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">1</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="kc">null</span><span class="p">());</span>
</pre></div>
</td></tr></tbody></table>

<p>Is equivalent to:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3
4
5
6
7</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">1</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="p">{</span>
  <span class="k">try</span> <span class="p">{</span>
    <span class="k">return</span> <span class="kc">null</span><span class="p">();</span>
  <span class="p">}</span> <span class="k">catch</span> <span class="p">(</span><span class="nx">error</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">return</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="nx">error</span><span class="p">);</span>
  <span class="p">}</span>
<span class="p">});</span>
</pre></div>
</td></tr></tbody></table>

<p>Native implementations of promises will track these and report the ones
that are not handled. There’s no specification about what constitutes a
“caught error” in a promise, so development tools will differ on how
they report it. Chrome’s development tools, for example, will output all
instances of rejected promises to the console, which might give you
false positives.</p>

<h4><code>.then</code> invokes dependencies asynchronously</h4>

<p>While our previous implementation of promises invokes the dependent
computations synchronously, standard ECMAScript promises do so
asynchronously. This makes it very hard for one to depend on the value
of a promise without using the proper means to do so: the <code>.then</code>
method.</p>

<p>Thus, the following code would not work:</p>

<table class="highlighttable"><tbody><tr><td class="linenos"><div class="linenodiv"><pre><code class="language-js" data-lang="js">1
2
3
4
5</code></pre></div></td><td class="code"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">value</span><span class="p">;</span>
<span class="nx">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="mi">1</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="nx">value</span> <span class="o">=</span> <span class="nx">x</span><span class="p">);</span>
<span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="nx">value</span><span class="p">);</span>
<span class="c1">// =&gt; undefined</span>
<span class="c1">// (`value = x` happens here, after all other code has finished)</span>
</pre></div>
</td></tr></tbody></table>

<p>This ensures that dependent computations always execute on an empty
stack, though such guarantees are less essential in ECMAScript 2015,
which requires that all implementations support proper tail calls<sup id="fnref:7"><a href="#fn:7" class="footnote">7</a></sup>.</p>

<h2 id="when-are-promises-a-bad-fit">7. When Are Promises A Bad Fit?</h2>

<p>While promises work nicely as a concurrency primitive, they are neither
as general as Continuation-Passing Style, nor are they the best
primitive for all use cases. Promises are placeholders for values that
will eventually be computed, so they can only make sense in contexts
where you would use those values themselves.</p>

<p class="centred-image full-image"><img src="/files/2015/09/promises-13.png" alt="">
<em>Promises only make sense in the <strong>value</strong> context</em></p>

<p>Trying to use promises for anything besides that is going to result in
very complicated codebases that are hard to maintain, understand, and
extend. The following are some examples where promises should be
entirely avoided:</p>

<ul>
  <li>
    <p><strong>Notifying the progress of computing a particular value</strong>. Promises are
used in the same context as the value itself, so just like we can’t
know the progress of computing a particular string, given the string
itself, we can’t do that for promises. Because of this, if you’re
interested in knowing how much of a file has been downloaded, you’ll
want a separate thing, like Events.</p>
  </li>
  <li>
    <p><strong>Producing multiple values over time</strong>. Promises can only represent a
single eventual value. For the cases where several values might be
produced over time (the equivalent of asynchronous iterators), one
would need something like Streams, <a href="http://reactivex.io/documentation/observable.html">Observables</a>, or <a href="http://www.usingcsp.com/cspbook.pdf">CSP</a> Channels.</p>
  </li>
  <li>
    <p><strong>Representing actions</strong>. This also means that it’s not possible to
execute promises in order, since once one has got a promise, the
computation that provides the value for it has already started. For
actions you can use <a href="http://matt.might.net/articles/by-example-continuation-passing-style/">CPS</a>, a <a href="http://www.haskellforall.com/2012/12/the-continuation-monad.html">Continuation monad</a>, or a
<a href="https://www.cl.cam.ac.uk/teaching/1213/R204/asynclecture.pdf">Task (co)monad</a>,
like C♯ does.</p>
  </li>
</ul>

<h2 id="conclusion">8. Conclusion</h2>

<p>Promises are a great way of dealing with eventual values, allowing one
to compose and synchronise processes that depend on values that are
computed asynchronously. And while the ECMAScript 2015 standard for
promises has its own set of issues, like automatically reifying errors
that should crash the process, it’s a decent enough tool to deal with
the aforementioned problem. Whether you use them or not, an
understanding of what they are and how they work is essential, now that
they’re going to be even more pervasive in the all ECMAScript projects.</p>

<h2 id="references">References</h2>

<dl>
  <dt><a href="http://www.ecma-international.org/ecma-262/6.0/">ECMAScript® 2015 Language Specification</a></dt>
  <dd><em>Allen Wirfs-Brock</em> —
Defines the standard for Promises in JavaScript.</dd>
  <dt><a href="http://www.ps.uni-saarland.de/Papers/abstracts/alice-looking-glass.html">Alice Through The Looking Glass</a></dt>
  <dd><em>Andreas Rossberg, Didier Le Botlan, Guido Tack, Thorsten Brunklaus,
and Gert Smolka</em> —
Presents the Alice language, which supports concurrency through
futures and promises.</dd>
  <dt><a href="https://www.haskell.org/definition/haskell98-report.pdf">Haskell 98 Language and Libraries</a></dt>
  <dd><em>Simon Peyton Jones</em> —
Describes, informally, the semantics of the Haskell programming language.</dd>
  <dt><a href="http://www.usingcsp.com/cspbook.pdf">Communicating Sequential Processes</a></dt>
  <dd><em>C. A. R. Hoare</em> —
Describes concurrent combinations of processes, such as deterministic
and non-deterministic choices.</dd>
  <dt><a href="http://homepages.inf.ed.ac.uk/wadler/papers/marktoberdorf/baastad.pdf">Monads For Functional Programming</a></dt>
  <dd><em>Philip Wadler</em> —
Describes, amongst other things, how monads can be used for error
handling in functional languages. Promise’s sequencing and error
handling is very similar to the monadic formulation, although Promises
don’t implement the monad interface in the ECMAScript 2015 standard.</dd>
</dl>

<h2 id="additional-resources">Additional Resources</h2>

<dl>
  <dt><a href="https://github.com/robotlolita/robotlolita.github.io/tree/master/examples/promises">Source Code For This Blog Post</a></dt>
  <dd>Contains all of the (commented) source code for this blog post (including a
minimal implementation of promises conforming to the ECMAScript 2015
specification).</dd>
  <dt><a href="http://robotlolita.me/2013/06/28/promises-considered-harmful.html">Promises/A+ Considered Harmful</a></dt>
  <dd><em>Quildreen Motta</em> —
Discusses some of the problems that the Promises/A+ and the ECMAScript
2015 Promises standard have, in terms of complexity, error handling,
and performance.</dd>
  <dt><a href="https://www.gitbook.com/book/drboolean/mostly-adequate-guide/details">Professor Frisby’s Mostly Adequate Guide to Functional Programming</a></dt>
  <dd><em>Brian Lonsdorf</em> —
An introductory book to functional programming in JavaScript.</dd>
  <dt><a href="https://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/">Callbacks Are Imperative, Promises Are Functional: Node’s Biggest Missed Opportunity</a></dt>
  <dd><em>James Coglan</em> —
Contrasts Continuation-Passing Style and Promise for describing a
program’s order of execution.</dd>
  <dt><a href="http://www.infoq.com/presentations/Simple-Made-Easy">Simple Made Easy</a></dt>
  <dd><em>Rich Hickey</em> —
While not directly related to promises, Rich’s talk discusses
“simple” and “easy” in the context of design, which is always relevant
to programming.</dd>
  <dt><a href="https://blog.mozilla.org/dherman/2011/01/30/proper-tail-calls-in-harmony/">Proper Tail Calls in Harmony</a></dt>
  <dd><em>Dave Herman</em> —
Discusses the benefits of having Proper Tail Calls in ECMAScript.</dd>
  <dt><a href="http://queue.acm.org/detail.cfm?id=2169076">Your Mouse is a Database</a></dt>
  <dd><em>Erik Meijer</em> —
Discusses the coordination and orchestration of event-based and
asynchronous computations in Rx using the concept of Observables.</dd>
  <dt><a href="https://github.com/substack/stream-handbook">Stream Handbook</a></dt>
  <dd><em>James Halliday (substack)</em> —
Covers the basics of writing Node.js programs with Streams.</dd>
  <dt><a href="http://matt.might.net/articles/by-example-continuation-passing-style/">By Example: Continuation-Passing Style in JavaScript</a></dt>
  <dd><em>Matt Might</em> —
Describes how continuation-passing style can be used for handling
non-blocking computations in JavaScript.</dd>
  <dt><a href="http://www.haskellforall.com/2012/12/the-continuation-monad.html">The Continuation Monad</a></dt>
  <dd><em>Gabriel Gonzalez</em> —
Discusses the concept of continuations as monads, in the context of
the Haskell programming language.</dd>
  <dt><a href="https://www.cl.cam.ac.uk/teaching/1213/R204/asynclecture.pdf">Pause ‘n’ Play: Asynchronous C♯ Explained</a></dt>
  <dd><em>Claudio Russo</em> —
Explains how asynchronous computations work in C♯ using the Task
comonad, and how that solution relates to other models.</dd>
</dl>

<h2 id="resources-and-libraries">Resources and Libraries</h2>

<dl>
  <dt><a href="https://www.npmjs.com/package/es6-promise">es6-promise</a></dt>
  <dd>A polyfill for ECMAScript 2015 standard promises, for platforms that don’t implement ES2015.</dd>
  <dt><a href="https://www.npmjs.com/package/bluebird">Bluebird</a></dt>
  <dd>An efficient Promises/A+ implementation.</dd>
</dl>

<div class="contact-footer">
    Quil swore she was never going to touch promises ever again. She's wearing gloves now. You can contact her on <a href="https://twitter.com/robotlolita">Twitter</a> or <a href="mailto:queen@robotlolita.me">Email</a>.
</div>

<hr>

<h4 class="normalcase borderless">Footnotes</h4>

<!--
Local Variables:
ispell-local-dictionary: "british"
End:
-->
<div class="footnotes">
  <ol>
    <li id="fn:1">

      <p>You can’t extract the values of promises in Promises/A,
Promises/A+ and other common formulations of promises in JavaScript.</p>

      <p>In some JavaScript environments, like Rhino and Nashorn, you might
have access to implementations of promises that support extracting
the value out of it. Java’s Futures are an example.</p>

      <p>Extracting a value that hasn’t been computed yet out of a promise
requires blocking the thread until that value is computed, which
doesn’t work for most JS environments, since they’re
single-threaded. <a href="#fnref:1" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:2">

      <p>“Lambda Abstraction” is the name Lambda Calculus gives to these
anonymous functions that abstract over terms in an
expression. JavaScript’s anonymous functions are equivalent to LC’s
Lambda Abstractions, however JavaScript also allows one to name
their functions. <a href="#fnref:2" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:3">

      <p>This separation of “computation definition” and “execution of
computations” is how the Haskell programming language works. A
Haskell program is nothing more than a huge expression that
evaluates to an <code>IO</code> data structure. This structure is somewhat
similar to the <code>Promise</code> structure we’ve defined here, in that it
only defines dependencies between different computations in the
program.</p>

      <p>In Haskell your program must return a value of
type <code>IO</code>, which is then passed to a separate interpreter. The interpreter
only knows how to run <code>IO</code> computations and respect the dependencies
it defines. It would be possible to define something similar for
JS. If we did that all of our JS program would be just one
expression resulting in a Promise, and that Promise would be passed
to a separate component that knows how to execute Promises and their
dependencies.</p>

      <p>See the
<a href="https://github.com/robotlolita/robotlolita.github.io/tree/master/examples/promises/pure/">Pure Promises</a>
example directory for an implementation of this form of promises. <a href="#fnref:3" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:4">

      <p>A Monad is an interface that can be (and often is) used for
sequencing semantics, when described as a structure with the
following operations:</p>

      <pre class="simple-code"><code class="language-haskell">class Monad m where
  -- Puts a value in the monad
  of    :: ∀a. a -&gt; Monad a

  -- Transforms the value in the monad
  -- (The transformation must maintain the same type)
  chain :: ∀a, b. m a -&gt; (a -&gt; m b) -&gt; m b
</code></pre>

      <p>In this formulation, it would be possible to see something like
JavaScript’s “semicolon operator” (i.e.: <code>print(1); print(2)</code>) as
the use of the monadic <code>chain</code> operator: <code>print(1).chain(_ =&gt;
print(2))</code>. <a href="#fnref:4" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:5">

      <p>This is using Rich Hickey’s notion of “complex” and “easy”. <code>.then</code>
is definitely an easy method. It caters to the common use cases, at
the expense of conceptual simplicity. That is, <code>.then</code> does too many
things, and those things have a fair amount of overlapping.</p>

      <p>A simple API, on the other hand, would move these separate concepts
to different functions which you’d be able to use together with the
<code>.then</code> method. <a href="#fnref:5" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:6">

      <p>The <code>.then</code> method assimilates the state and value of everything
that looks like a Promise. Historically, this was done through an
interface check, and this meant just checking if the object provided
a <code>.then</code> method, which would include all objects whose <code>.then</code>
method doesn’t conform to the Promise’s <code>.then</code> method.</p>

      <p>If standard Promises weren’t limited by backwards compatibility with
existing promises implementation it would be possible to have a more
reliable test, by using Symbols for interfaces, or some similar form
of branding. <a href="#fnref:6" class="reversefootnote">↩</a></p>
    </li>
    <li id="fn:7">

      <p>Proper Tail Calls are a guarantee that all calls in tail position
will happen with constant stack. In essence, this guarantees that as
long as your program or computation is made up entirely of tail
calls, the stack will not grow, and thus stack overflow errors are
impossible in such code. Incidentally, it also allows an
implementation of the language to make such code much faster, as it
doesn’t need to deal with some of the usual overhead of function
calls. <a href="#fnref:7" class="reversefootnote">↩</a></p>
    </li>
  </ol>
</div>

