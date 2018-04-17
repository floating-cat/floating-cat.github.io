---
layout: post
title: "[废弃]粗浅地认知 C"
date: '2018-03-19 20:32:00 +0800'
categories:
  - programming
published: false
---

> 这篇写了好一会儿，突然在想写这样的文章的意义又有多少。无论如果我觉得这篇文章里的很多内容，对于熟悉 C 语言和操作系统的人来说，就变得索然无味了，这样的文章的价值又有多少呢。如果只是想让不太了解 C 语言的人也能获得类似的知识的话，详尽地讲解这些细节又有什么深远的意义呢（至少我也觉得一点也不有趣）。无论如何我想写一些，自己体会到的心情（或者经历过的值得记录的心情），一些更不一样的东西，所以这篇文章到后面只是列出了大纲，这是一篇被废弃的文章。

曾经很长一段时间（甚至此时此刻）我总希望我能花点时间重新并且全面地学习一遍 C，不仅仅局限于我原来读书时代对于 C 语言的那些只是语法层面的认知，*We Need To Go Deeper* —— 能对 C11、一些 C 语言的惯用法乃至现代的 C 有一个认知。另一个段相对长的时间，我总是希望我能学会掌握 C++（也许掌握这词语太过狂傲了，请把它理解为*使用*），因为我喜欢 KDE 乃至 Qt，我对 Qt 是 GUI frameworks 的真理之一一直深信不疑。如果说难是一种邪恶的话，我希望我能掌握这一种邪恶。

但是无论我是相当愚钝的，讨厌那些过多的历史遗留的不好的设计、对繁琐复杂的语法毫无任何抵抗力，甚至有些畏惧那些繁多 C++ 的最佳实践。最近在又重新看了一遍《The C Programming Language》后，感觉我对于 C 语言有了一些肤浅的认识，希望能用我自己的看法重新演绎一遍我对于 C 语言的认知，以及我所看到的 C 语言所提供的抽象之下它所掩盖的东西。另外在看完这本书之后，对于一个在生活和工作中并不是很需要用到 C/C++ 的我来说，我决定舍弃我以前对于 C 乃至 C++ 的一些痴想，人生总是需要往前行的。这也是这篇文章意义之所在。

## 表示/表现/演绎
在编程的时候，我们做过最多的事情之一就是声明变量，对变量的值进行修改或者产生出新的值。我们可以想象这些变量所对应的值被地存放在了一个存储空间里，这些存储空间的每一个小格子都是一个 0 或者 1 的状态位（当然更本质点讲，这些 0 或者 1 的状态本身被其他东西编码，比如说电路），通过对这些 0 和 1 的状态位进行组合，这些变量本身所对应的值/数据本身得以用二进制进行编码，从而得以存储。我们可以把一个 4 字节的存储空间所代表的东西看成是 4 个紧挨着的大小为 1 字节的无符号数、4 个紧挨着的大小为 1 字节的有符号数，或者 1 个 4 字节的浮点数。几字节的储存空间可以以任何方式被解码（以补码的形式、IEEE 754 标准等）成为一个对我们来说有特定意义的抽象。绝大部分时候我们通过原来编码方式所对应的解码方式对这几个字节进行解码，从而对这些数据进行表现。如果解码的方式不正确，所呈现出来的数据形式就可能不是你想要的了。当然这不同于不同的人对待相同的事物的看法各持己见那样 —— 我们可以通过对相同的事物进行不同的演绎/表现，而获得不同的情感。“机械式”的设备就愚钝许多了。

二进制的序列值通过可以解码得以表现，在 C 语言中我们可以看到很多类似的或者走的更远的表示/表现的例子。

下面，让我们来看一些 C 语言的代码片段吧 (:

### printf

{% highlight C %}
int printf (const char * format, ... );

int a = 7;
printf("%d", a);
{% endhighlight %}

这是一段非常简单的 `printf` 的代码。`printf` 是一个接受可变参数的函数。实际上 `printf` 就是一个解释器，第一个参数是一个格式化字符串，之后的可变参数是提供给这个解释器额外的参数。在调用 `printf` 的时候，参数按值传递，`format` 之后的可变参数还需要进行 *默认参数提升* （规格规定）。在上面的这个例子里，当解释器解析到 `%d` 时，它明白你传给他的第二个实参实际上是一个有符号的整数，所以以有符号的整数形式对从该实参开始的地址对应的二进制序列进行解码/表示。当我们把当前例子里的 `%d` 改成其他格式化说明符的时候，解释器会用不同的解码/表现方式来呈现 `a` ，当然实际上这时候这就是一个 undefined behavior（规格规定）。

### Union（联合体）
{% highlight C %}
union U {
    short s;
    int i;
    double d;
};
{% endhighlight %}

这是一段非常简单的 C 语言联合体的声明。引用 [cppreference](http://en.cppreference.com/w/c/language/union) 里一段精简了的对联合体的解释：

> The union is only as big as necessary to hold its largest member (additional unnamed trailing padding may also be added). The other members are allocated in the same bytes as part of that largest member. A pointer to a union can be cast to a pointer to each of its members (if a union has bit field members, the pointer to a union can be cast to the pointer to the bit field's underlying type). If the member used to access the contents of a union is not the same as the member last used to store a value, the object representation of the value that was stored is reinterpreted as an object representation of the new type (this is known as type punning).

联合体里的所有成员都是共享同一段内存的，并且每一个成员存放的起始位置都是当前联合体的基地址。拿上面的联合体 `U` 举例子，我们可以在这段内存中存放联合体 `U` 中任意一个成员（如 `short`、`int` 或者 `double`），并且在需要的时候通过 `s`、`i` 或者 `d` 来引用使用。实际上这个联合体的名字只是用来告诉编译器，它改用什么样的表现形式对当前联合体的基地址开始的二进制序列进行解码/表示。当然因为联合体内的不同成员的长度不同，所以这个联合体会被分配到能容纳该联合体内最大的成员的一段内存中（因为[内存对齐](https://en.wikipedia.org/wiki/Data_structure_alignment)的问题，该内存的尾部可能还会放置额外的填充）。

在我们使用这段内存的时候，实际上计算机并不在意你当前使用的成员的类型大小是否填满了该段内存。假设上面这个联合体 `U` 在一个计算机的内存中占用 8 字节，`short` 类型在内存中占用 2 字节，`int` 类型在内存中占用 4 字节，`double` 类型在内存中占用 8 字节。当我们只对 `U` 中的 `i` 进行赋值和使用的时候，实际上我们只使用这段内存中的前 4 个字节。如果我们对 `d` 进行赋值，再通过 `i` 的形式读取，那么我们只使用了原 `double` 类型所占用的这段内存的前 4 个字节，并把它解码/表示/reinterpreted 成 `int`。这也就是为什么我们可以在联合体的指针和该联合体里的任意一个成员的指针中任意转换。我们只是从该联合体的基地址开始，对一段共用的内存开始的二进制序列进行表示/表现。

在 《The C Programming Language》的第 8.7 节实现一个非系统提供的 `malloc`，为了使该 `malloc` 返回的储存空间对齐，也使用了联合体（因为这个例子比较复杂，该文就不详细介绍了，感兴趣的读者可以查阅原书）：

{% highlight C %}
typedef long Align;

union header {
    struct {
        union header .ptr;
        unsigned size;
    } s;
    Align x;
} ;

typedef union header Header;
{% endhighlight %}

### void *
C 语言的抽象并不多，但是这并不影响我们用 C 来进行 *generic programming*。

被废弃的后文：
与这份[讲义](http://cs.boisestate.edu/~amit/teaching/253/handouts/07-c-generic-coding-handout.pdf)的内容类似（如果能发邮件征得引用大部分内容的话就更好了），讲述一下如何用 `void *` 来写*polymorphic function*  和 *generic data structures*（该讲义举的 `min` 函数和 `List` 例子都非常的好）。然后再引申出用 `void *` 来表示/表现这些抽象的过程中，其他类型的指针（包括指针函数）被转换，成为具体实现的演绎。

第二大节标题为内存布局，主要讲在一般的操作系统架构下一个 C 程序大致的布局。简要地描述一下 `text`、`data`、`stack` 和 `heap` 这些数据段，并引入 `call stack`（包含调用函数的时候入参、返回地址和本地变量的情况）。在这大节下的几个小结，讨论一下 C 语言在该内存布局下的一些抽象泄露的例子。第一小节，会重新回到原来前文提到的 `printf` 的例子，讲述当 `printf` 的可变参数和格式化字符串对应的参数个数不一样的情况（另外也可以提及 *format string vulnerability*）；第二小节，会讲述变长参数的实现的原理；第三小节，会讲述 `setjmp` 和 `longjmp`；第四小节，会讲述 *buffer overflow*。最后一小节，讲述一下[内存管理](https://en.wikipedia.org/wiki/C_(programming_language)#Memory_management)。

最后杂项的大节也许可以提一下*系统调用*还有一些其他的例子（只是现在写这段的我已经不知道还有什么可以适合提的了）。
