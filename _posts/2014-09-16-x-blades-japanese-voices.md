---
layout: post
title: X-Blades Japanese Voices
date: "2014-09-16 9:00:00 +0800"
categories: 
  - journey
published: true
---

> https://drive.google.com/file/d/0B3Ap9NYzzJSOWkxmUmQ3TjdFbE0/edit?usp=sharing
{: style="overflow-wrap: break-word"}

前段时间，在 Steam 上买了 X-Blades，为了使用日语语音而鼓捣了好久——虽然玩后觉得这游戏是有点烂。

UBISOFT (JP) 在日本专门发行了[日版](http://www.ubisoft.co.jp/xblades/)，而 Steam 版是由 TopWare Interactive 发行，包含了多国的语言 （不含日语）。虽然这游戏是跨平台游戏，但是相对于日版来说，PC 版比 PS3/Xbox 360 更难下载到，尤其是让我用 Share 、Perfect Dark 之类的软件完整地下完这游戏，应该很难吧 。

所幸经过一番搜索，在 [3DM](http://bbs.3dmgame.com/thread-3034762-1-1.html) 上有人提取了 PS3 日版的语音。经过下载并解压后，可以看到里面有 sounds 和 video 这2个文件夹。我们只需要将 PC （这里及下文指代的 PC 版皆指代 Steam 版）上的这两个文件夹替换掉就行了。（为什么 PS3 版可以用于 PC 版呢？跨平台开发方便嘛，当然也有一些凑巧的成分在）

```cmd
>tree /F

D:.
├─sounds
│      english_voice_ayumi.fsb
│      english_voice_dark_temple.fsb
│      english_voice_gotik.fsb
│      english_voice_mega_gate_ev.fsb
│      english_voice_mega_gate_zl.fsb
│      english_voice_pl_level5.fsb
│      english_voice_tample_w.fsb
│
└─video
       00_intro.english.audio.ogg
       01_game_start.english.audio.ogg
       02_meet_light_one.english.audio.ogg
       03_defeat_light_one.english.audio.ogg
       04_dark_dream.english.audio.ogg
       05_trap.english.audio.ogg
       06_meet_friend.english.audio.ogg
       07_meet_dark_one.english.audio.ogg
       08_dark_one_escape.english.audio.ogg
       09_dark_temple.english.audio.ogg
       10_curse_transfer.english.audio.ogg
       11_dark_one_again.english.audio.ogg
       12_dark_friend.english.audio.ogg
       13_dark_friend_escape.english.audio.ogg
       14_before_final_battle.english.audio.ogg
       15_bad_ending.english.audio.ogg
       16_good_ending.english.audio.ogg
```

拿 sounds 文件夹下的 english_voice_ayumi.fsb 文件来讲：**ayumi** 是女主角的名字；FSB 后缀的文件格式全称为 FMOD's sample bank format。我们可以通过 [FSB Extractor](http://aezay.dk/aezay/fsbextractor/) 这个软件来看下里面有什么。

![english_voice_ayumi.fsb](/assets/images/x_blades_japanese_voices/english-voice-ayumi-fsb.png){: width="1280" height="720"}

一个 FSB 文件可以封装许多的音频文件，从截图中我们就可以看出。这个文件里有女主角的许多语音，如死亡和击打时的声音。

而 video 文件夹下是 CG 播放时的声音 （包括背景音乐和语音，ogg 后缀是常见的音频格式）。从 sounds 和 video 文件夹下的文件命名我们就不难看出每个文件都有语言标识，如 english_voice_ayumi.fsb 中的 english 就标识当游戏语言设置为英语时，调用该语音文件。可想而知原 PS3 上该文件可能取名为 japinese_voice_ayumi.fsb，后经 3DM 的这位好心的分享者重命名后，使用者只需要简单地替换掉 PC 游戏目录下原来的英文文件就行了 （游戏里要设置语言为英文就行，当然你也可以把文件名改为其他的语言标识，然后在设置里设置为该语言就行了）。

那么为什么我在上面大篇幅介绍了这些替换文件呢？因为在实际的替换后，CG 的声音完全正常，而女主角的一些语音，如击打时发出的声音就特别的奇怪……通过我上文介绍的 FSB Extractor 这个软件对 sounds 文件夹下的文件与原本未替换前的备份文件进行对比，很明显 english_voice_ayumi.fsb 这个文件有古怪！

![english_voice_ayumi.fsb PS3 VS PC](/assets/images/x_blades_japanese_voices/english-voice-ayumi-fsb-ps3-vs-pc.png){: #pic-english-voice-ayumi-fsb-ps3-vs-pc width="1270" height="720"}

我将2个 FSB 文件里的音频文件进行了截图 （按音频文件名的顺序排列）。可以看到到左下角——替换文件 **Number of Entries 40**，原文件 **Number of Entries 36**，这说明了 PS3 日版该文件比原文件多了4个音频文件。原文件有1个 fall_to_death，而替换文件有5个 fall_to_death，并且原来的后缀 wav 是小写的，而替换的是大写的，这里也可以看出一点端倪来。

那该怎么办呢？我们将使用一个叫 [fsbext](https://github.com/gdawg/fsbext) 的开源软件来帮忙吧。

我们将原文件夹 sounds 下的 english_voice_ayumi.fsb 重命名为 english_voice_ayumi_original.fsb，并将替换文件下的这个文件重命名为 english_voice_ayumi_jp.fsb。再将编译后的 fsbext 可执行程序和这2个文件放置在同一个文件夹下。

```bat
rem 最前面这3个英文是表示注释，我也是 Google 来的
rem 这是 Windows 下面的批处理文件的代码
rem md 表示新建文件夹
md english_voice_ayumi_original
md english_voice_ayumi_jp

rem -v       verbose output, debugging informations
rem -s FILE  binary file containing the informations for rebuilding the FSB file
rem -d DIR   output folder where extracting the files
fsbext -v -s english_voice_ayumi_original.dat -d english_voice_ayumi_original english_voice_ayumi_original.fsb
fsbext -v -d english_voice_ayumi_jp english_voice_ayumi_jp.fsb
```

首先我们新建了2个空的文件夹，然后通过调用 `fsbext` 来提取 fsb 文件里的音频和相关的数据文件。

```cmd
>tree /F

D:.
│      english_voice_ayumi_jp.fsb
│      english_voice_ayumi_original.dat
│      english_voice_ayumi_original.fsb
│      fsbext.exe
│
├─english_voice_ayumi_jp
│      death_01.wav
│      death_02.wav
│      ...
│
└─english_voice_ayumi_original
       death_01.wav
       death_02.wav
        ...
```

为什么我们要新建2个文件夹呢？因为调用 `fsbext` 时，我们使用了 `-d` 参数，将 fsb 文件里的音频文件提取到该文件夹下。如果不新建文件夹，程序会报错，因为 `fsbext` 不会主动地新建文件夹。在我们提取的文件里，english_voice_ayumi_original 文件夹下的音频文件其实是没有用的，称为副产物也不为过。实际上我们需要的是原 fsb 文件重建的数据文件 （english_voice_ayumi_original.dat，来自english_voice_ayumi_original.fsb）和重建 fsb 文件所需的日语音频文件  	（english_voice_ayumi_jp 下，来自english_voice_ayumi_jp.fsb）。因为我们不需要替换文件重建的数据文件，所以在上面的批处理命令里 `fsbext -v -d english_voice_ayumi_jp english_voice_ayumi_jp.fsb` 并没有带 `-s` 参数了。如果奇怪为什么既然我们不需要原文件语音，为什么还要在 `fsbext -v -s english_voice_ayumi_original.dat -d english_voice_ayumi_original english_voice_ayumi_original.fsb` 加了 `-d` 的选项——因为如果不加的话，程序也会主动地提取音频文件，并放置在当前的目录下。所以我们通过设置 `-d`，将这些不需要的音频文件放在一个文件夹下，以免污染我们当前的目录。

下面我们可以将 english_voice_ayumi_jp 里的 5个 fall_to_death 中的任意4个删除 （你喜欢哪个语音就留哪个:)），只留下其中一个，并将其重命名为原文件里的 fall_to_death.wav。现在来使用原文件的数据文件 english_voice_ayumi_original.dat 和修改过的 english_voice_ayumi_jp 下的音频文件来重建我们需要的可以使用的日语语音的 fsb 文件吧。

```bat
rem -r       rebuild the original file, in short when you use -s:
rem          if you do NOT use -r will be created the binary file with the info
rem          if you use -r will be read the binary file (-s) and will be created a
rem          new FSB file (so it becomes the output and not the input)
rem          Example:   fsbext -s files.dat    input.fsb
rem                     fsbext -s files.dat -r output.fsb
fsbext -s english_voice_ayumi_original.dat -d english_voice_ayumi_jp -r english_voice_ayumi.fsb
```

写了那么多字，有点累了……但是实际上我们离成功还有一步之遥。如果你用 FMOD Event Player （这个软件包含在 [FMOD Ex Designer](http://www.fmod.org/download/) 里） 来播放该文件时 （需要将原文件夹 sounds 下的 english_voice_ayumi.fev 和重建后的 english_voice_ayumi.fsb 放置在同一个文件夹下才行，类似于 CUE 与 FLAC 的关系），你就会发现其中的语音变成了噪音 （类似于收音机的那种电波哦~~）。

现在再来看下 [图2](#pic-english-voice-ayumi-fsb-ps3-vs-pc) （看截图的 Channels 这个字段） 吧，因为 PS3 的 fsb 文件里的音频文件是双音轨 （只有个别几个是单音轨），而 PC Steam 版里的音频文件是单音轨……是不是有点无语了！

解铃还须系铃人嘛，我们来看下 fsbext 的源代码文件 [`fsb.h`](https://github.com/gdawg/fsbext/blob/master/src/fsb.h) 吧。搜索一下 channels 就可以找到以下代码了。

```c
typedef struct {
    char        name[32];

    uint32t    lengthsamples;
    uint32t    lengthcompressedbytes;
    int32t     deffreq;
    uint16t    defpri;
    uint16t    numchannels;    /* I'm not sure! */
    uint16t    defvol;
    int16t     defpan;
    uint32t    mode;
    uint32t    loopstart;
    uint32t    loopend;
   
} FSOUNDFSBSAMPLEHEADER1;
```

当然搜索到的结果里还有一些类似的数据结构包含有 `numchannels` 这个字段。但是没关系，我们可以看到 `numchannels` 这个字段是 `uint16t`，也就是说这是个 16 bits 的 `unsigned int`。也就是说对于 fsb 文件里的音频，单声道是用 01 来表示，而双声道是 02。

接下来就比较简单了，我们有2条路可以选择：一条是直接修改重建后的 fsb 文件，另一条就是修改用来重建用的数据文件 （也就是 english_voice_ayumi_original.dat)。这里我们选择第2条路，因为这个文件比较小、相比较下改起来也方便。原理非常简单，就是把 english_voice_ayumi_original.dat 这个文件中原本 PC 版声道数1的改为对应 PS3 版声道数为2的 （很容易在思维上将2者弄反）。

下面我们用文本编辑器打开 english_voice_ayumi_original.dat （以 十六进制视图 对文件进行加载）。

![english_voice_ayumi_original.dat](/assets/images/x_blades_japanese_voices/english-voice-ayumi-original-dat.png){: width="630" height="720"}

可以说是非常幸运，01 的搜索结果不多——为39个。而 fsb 文件里有36个音频文件，所以这当中只有3个搜索结果是干扰项。我们可以从截图中看到差不多每个音频文件名后面都有这样的一个字段，那么我们只要耐性地比对下该音频声道字段在音频文件名后的大概位置就可以将另外3个干扰项给排除掉。最后值得注意的是，实际上PS3版的这个 fsb 有个别音频是单声道的，这几个不用改就可以了，将其他的 01 替换为 02 就大功告成了。

最后删除掉我们原先重建的 english_voice_ayumi.fsb，再执行一遍 `fsbext -s english_voice_ayumi_original.dat -d english_voice_ayumi_jp -r english_voice_ayumi.fsb`。我们想要的最后可以使用的日语语音的 fsb 文件就获得了，替换掉原文件后，开始游戏吧。
