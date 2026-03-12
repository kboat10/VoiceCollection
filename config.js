// Configuration file for the voice recording application

const CONFIG = {
    // API Configuration
    api: {
        // Crowdsource submission endpoint
        endpoint: 'http://45.55.247.199/api/crowdsource/submit'
    },

    // Recording Settings
    recording: {
        // Maximum recording duration in seconds
        maxDuration: 15,
        
        // Sample rate (16000 Hz is good for speech)
        sampleRate: 16000,
        
        // Bit rate for encoding
        audioBitsPerSecond: 128000,
        
        // Silence detection threshold (0-255, lower = more sensitive)
        silenceThreshold: 10,
        
        // Minimum recording duration in seconds
        minDuration: 0.5
    },

    // Research Study Phrases
    phrases: [
        "I keep meaning to reorganise my bookshelf but every time I start I end up just sitting on the floor reading old stuff. It's been like that for three years now and I genuinely don't see it changing anytime soon.",
        "My upstairs neighbour started learning the violin about six weeks ago and honestly the progress has been remarkable. I wasn't expecting to enjoy it but some evenings I actually stop to listen before I get annoyed.",
        "There's this tiny cafe near the canal that only opens on Tuesday and Thursday mornings. The owner doesn't have a phone number listed anywhere, you just have to show up and hope for the best.",
        "I've realised I have a very different relationship with silence depending on whether I'm alone or with someone else. Alone it feels fine, sometimes even nice. With another person it starts feeling like a problem after about forty seconds.",
        "We drove past the house I grew up in last weekend and the new owners painted it this sort of sage green colour. It's actually an improvement but it still felt wrong somehow, like seeing someone else wearing your coat.",
        "My colleague brings the same lunch every single day, a cheese sandwich and a small bag of pretzels, and when I asked about it she said varying food is a waste of mental energy. I think about that more than I should.",
        "I tried running in the mornings for about two weeks this past spring and I won't say it made me feel good but it did make the rest of the day feel comparatively easy, which is probably its own kind of motivation.",
        "The problem with giving feedback on creative work is that you're always halfway between being honest and protecting the other person and I'm not sure there's a way to do both properly at the same time.",
        "I bought a plant last autumn with the intention of keeping it alive and it's still alive, which I have to say has given me an unreasonable amount of confidence in other areas of my life.",
        "There's a particular type of tiredness you get from too many video calls in one day that's completely different from the tiredness you get from actually working hard. The second one feels earned. The first one just feels bad.",
        "My dad has this habit of calling me just to tell me about something he saw on the news, not to discuss it, just to report it, and then he hangs up. I've stopped trying to have a conversation about it and started just listening.",
        "I can't remember the last time I was genuinely surprised by something. Not shocked, surprised. The kind where you weren't expecting it at all and for a moment you don't know what expression to make.",
        "We got delayed on the motorway for nearly two hours because of a lorry that had shed its load of what looked like office furniture. There were chairs in the middle of the road. Everyone got out of their cars to look.",
        "I've been trying to explain to my mum how to use voice messages and the main obstacle is that she keeps treating it like a phone call and then getting confused when nobody answers in real time.",
        "The thing nobody tells you about working from home long term is that eventually the line between being productive and just being physically present in the room where your laptop is becomes very difficult to identify.",
        "I signed up for a pottery class mostly to have something concrete to say when people ask what I do with my weekends. I ended up genuinely liking it, which I wasn't counting on and still feels slightly embarrassing to admit.",
        "My dog is seventeen now and spends most of the day sleeping in a patch of sunlight by the kitchen door. Sometimes he wakes up, looks around, decides nothing needs his attention, and goes back to sleep. I respect that enormously.",
        "I've noticed that the things I was most sure about when I was younger are exactly the things I'm least certain about now. I'm not sure whether that's wisdom or just accumulated confusion.",
        "We've been meaning to repaint the hallway since we moved in four years ago and at this point I wonder if leaving it is just becoming part of the character of the house.",
        "There's a crow that sits on the telegraph pole outside my window most mornings and I've started talking to it while I make coffee. It has not responded but it also doesn't leave, which I choose to interpret positively.",
        "I missed a flight once because I was so confident I knew where the gate was that I didn't double check. It was not where I thought it was. I now check the gate information an almost neurotic number of times.",
        "My flatmate and I have this unspoken agreement that whoever finishes the washing up first just leaves it and the other one puts it away. We've never actually discussed this. It just emerged and now it feels like a binding contract.",
        "I read somewhere that the average person makes about thirty five thousand decisions a day. I have no idea how that number was arrived at but since reading it I've been slightly more conscious of every one.",
        "There's a particular satisfaction in finishing something you've been putting off for weeks. It's not so much pride as it is relief and a mild sense of disbelief that it's actually done.",
        "I ordered something online three months ago and it never arrived. When I contacted the company they apologised and resent it and then both packages arrived on the same day. I now have two of something I only needed one of.",
        "My old university friend sends voice messages that are never less than four minutes long. I listen to them at one point five speed which feels rude but also feels necessary.",
        "I think the reason I don't enjoy most thrillers is that the tension comes from characters making decisions I would never actually make, so I spend the whole time wanting to shout at them rather than worrying about what happens.",
        "We had a new boiler fitted last winter and the engineer asked if I wanted to watch so I could understand the system. I said yes. I understood nothing but I nodded convincingly throughout and he seemed satisfied.",
        "I've started doing this thing where if I'm anxious about something I write down the specific thing I'm worried about. Usually once it's written down it seems more manageable or at least more finite.",
        "There's a junction near my office where the traffic lights have been broken for about six months and everyone has quietly worked out how to negotiate it without them. It functions better now than it did with the lights.",
        "I used to think that having a plan made things feel more in control but lately I've found that having a rough sense of direction and a high tolerance for adjusting it works better for me personally.",
        "My sister is significantly better at gift giving than I am. She remembers things people said in passing months earlier and finds something that connects to it. I usually panic two days before and buy something vague.",
        "I've been sleeping with the window slightly open for the past few weeks and the difference in how rested I feel in the morning has been noticeable enough that I'm annoyed I didn't do it sooner.",
        "There's a word in Welsh, hiraeth, that roughly means a longing for something you can't return to or maybe never had. I don't speak Welsh but I think about that word quite often.",
        "My neighbour has started composting and whenever I put something in the bin that could theoretically compost I feel a small but definite twinge of guilt, which I suspect is exactly the desired effect.",
        "I went to a talk last month by someone who's done ten years of field research on something I had no prior knowledge of and left feeling like I understood the world slightly differently. That doesn't happen often enough.",
        "I keep a list of films I want to watch and never watch them. I keep a separate list of books I want to read and never read them. I have, however, spent considerable time maintaining both lists.",
        "The thing I find most strange about getting older is not the physical stuff but how quickly you start to recognise patterns you've already lived through once and can see coming the second time.",
        "My phone autocorrects a particular name I type often into something completely different and I've corrected it so many times now that I've started questioning whether I'm the problem.",
        "I drove through a town I'd never heard of last summer and there was a hand-painted sign outside a house that just said 'eggs, always'. I didn't stop. I wish I had stopped.",
        "I have a very clear memory of being seven years old and deciding adults had everything figured out. The clarity of that memory makes the present situation feel particularly ironic.",
        "There's a specific sound a house makes at about three in the morning that I've never been able to explain. It's not threatening exactly, just present in a way that it isn't during the day.",
        "I attended a meeting last week that could have been a two sentence email and I spent the entire duration calculating how many hours of collective human time were being consumed in that room at that moment.",
        "My best friend and I have been having roughly the same conversation about whether to leave our respective jobs for about three years now. The conversation has evolved but the fundamental uncertainty has stayed the same.",
        "I spotted a heron standing absolutely still in the shallows of the river near my house this morning and I stopped walking and just watched it for a while. It caught something just as I was about to leave.",
        "I have this probably irrational attachment to physical maps even though I always use my phone for navigation. I like knowing what the space looks like from above rather than just being told where to turn.",
        "We had a power cut for about six hours last December and by hour four the whole street had congregated outside and were talking to neighbours we'd never spoken to before. The power came back and everyone went inside immediately.",
        "I find it difficult to throw away cards people have written to me. I have a box of them going back to childhood that I almost never open but can't get rid of. I'm not sure what that says about me.",
        "My cousin moved to a completely different country on about six weeks of planning and has seemed, by all available evidence, extremely happy since doing so. I admire this and find it completely terrifying.",
        "There's a particular quality of light you get on clear late autumn afternoons, very low and angled, that makes everything look slightly more significant than it probably is. I find it very difficult to stay indoors on those days.",
        "I've started noticing that when I'm genuinely listening to someone I stop planning what I'm going to say next. I'm not sure when I started doing the planning in the first place but I'm trying to stop.",
        "My grandmother used to say that the older you get the faster the years go but the slower the days get. I'm starting to understand what she meant by both halves of that.",
        "I walked the same route every day for two years and one afternoon noticed there was a mural on the side of a building I had apparently never registered before. I have no explanation for this.",
        "I've been trying to learn a few phrases in the language they speak where I'm going next month. The pronunciation is genuinely difficult and I suspect my attempts will land somewhere between charming and incomprehensible.",
        "There's a specific anxiety that comes from waiting for a reply to a message you weren't sure you should have sent. It's different from regular waiting. It has a particular texture.",
        "The first thing I do every morning before I'm properly awake is check my phone, which I know is not good, and every few months I decide to stop, and then I don't stop. I'm describing it because naming it is apparently a step.",
        "My partner and I disagree about the correct indoor temperature. We have reached an accommodation rather than a consensus and I am told this is what long-term cohabitation actually looks like.",
        "I had a conversation with a stranger on a delayed train platform last year that lasted forty minutes and covered a remarkable amount of ground. We didn't exchange any contact information. I think about that conversation sometimes.",
        "I know three things very well and a lot of other things moderately. I've been wondering lately whether it would be better to know one thing extremely well or to keep spreading across the moderate middle.",
        "There's something about tidying your workspace that makes you feel productive without actually requiring you to do any of the work. I use this strategically and without apology.",
        "My younger brother sends memes with no context at unpredictable hours and sometimes I don't understand them and I'm not sure if that's a generational thing or just a me thing and I haven't asked.",
        "I noticed last week that I apologise for things that aren't my fault quite a lot. I'm trying to pause before saying sorry and only say it when I actually mean it. It's harder than it sounds.",
        "We planted wildflowers in the back garden two summers ago and they came up, died, and then came back on their own this spring in a completely different spot. The garden is apparently making its own decisions now.",
        "I find airports strangely comforting. Everyone is going somewhere and nobody expects you to be productive and there's an agreed structure to the time. I've never told anyone this before because it sounds slightly unhinged.",
        "I'm reading a book at the moment that I'm not sure I'm enjoying but also can't stop reading. It's like it has something I want that I haven't quite identified yet.",
        "My doctor told me my blood pressure was slightly high and suggested cutting back on caffeine. I have since reduced my coffee intake from three cups to two and a half cups per day and feel I deserve recognition for this.",
        "There's a particular satisfaction in explaining something complicated in a way that actually lands for the other person. You can see when it happens. It's one of the better feelings available in everyday life.",
        "I went to a concert alone for the first time last year. I expected it to feel awkward and it didn't at all. I'm not sure whether the concert was particularly good or whether I was just more present without someone to talk to.",
        "My mum still prints out emails she wants to refer to later and keeps them in a folder. I used to find this baffling and now I kind of understand it. A physical thing is harder to lose than a tab you've left open.",
        "I've been using the same mug for about six years. It's not beautiful or particularly special but now the idea of switching feels unnecessarily disruptive and I've just committed to it indefinitely.",
        "There's a version of confidence I've noticed in some people where they're not performing certainty, they just genuinely seem unbothered by the possibility of being wrong. I would very much like to understand how that works.",
        "I was stuck in roadworks for twenty minutes yesterday behind a cement mixer and somehow found it meditative. I arrived at my meeting slightly late but considerably calmer than usual.",
        "My friend group has a chat where messages go unanswered for days and then someone says something and seventeen replies appear within a minute. There's no logic to the pattern but it's been consistent for years.",
        "I do a thing where I set my alarm fifteen minutes earlier than I need to with the intention of lying there and gradually waking up. I use that fifteen minutes to be on my phone. I know. I know.",
        "There's a bakery near the station that sells something they call a morning bun which is slightly different from what I've seen called a morning bun elsewhere and I've never asked about the discrepancy because I don't want them to change it.",
        "I reread a book this year that I last read when I was twenty. The book hadn't changed. The parts I thought were important then are not the parts I find important now and I'm not sure which version of me had better judgement.",
        "I was in a meeting where someone said something I disagreed with quite strongly and I thought about raising it and didn't, and then thought about it for the rest of the day, which suggests I should probably have raised it.",
        "My commute takes thirty minutes and I've started treating it as the only time in my day where nobody can reasonably expect anything from me. It's not exactly relaxing but it is genuinely mine in a way the rest of the day isn't.",
        "We got a second key cut for the house last month and put it somewhere sensible to avoid future lockouts and neither of us can now remember where sensible was.",
        "I tried meditating properly for about three weeks. Not the app kind, actual sitting still and breathing. I think it did something useful but I couldn't articulate what and eventually I just stopped.",
        "There's a sound recordings don't capture well and that's the specific quality of a room full of people before an event starts. The expectation in that noise is unlike anything else and I always want to remember it.",
        "My grandfather used to say that the best conversations happen when nobody's trying to win anything. I didn't fully understand that until I had a version of one recently and realised how uncommon they actually are.",
        "I've been trying to take fewer photographs and just look at things more. It's harder than it sounds because the urge to document comes before you've even decided whether the moment warrants it.",
        "There's a gap between knowing what you should do and being able to make yourself do it that no amount of information really closes. If anything more information seems to widen it.",
        "I found a journal I kept when I was about fifteen and read maybe four pages and then put it away. Some things are better left as memories than as primary sources.",
        "My office has one of those kitchens where the coffee machine is always being used and there's an unspoken queue system that everyone understands but nobody ever formally agreed to. Violations are handled through silence.",
        "I've started writing things down on actual paper again after years of doing everything digitally. There's something about the slowness of writing that changes what you end up saying.",
        "There's a park near my flat that I ran through every day for a year and recently went back to and it felt completely different, smaller, maybe, or just less urgent. I'm not sure the park changed.",
        "My flatmate started going to bed an hour earlier than she used to and reported that it changed her life. I tried it for a week and didn't think it changed mine and then a month later realised I'd quietly kept doing it.",
        "The strangest part of learning any skill is the period where you're just competent enough to see exactly how far you still have to go. Before that point you don't fully know what you're missing.",
        "I've noticed that when I'm having a good day I tend to attribute it to something specific, the weather, a good breakfast, a completed task. When I'm having a bad one I think it's just me.",
        "My building has a noticeboard in the lobby that nobody uses except for one recurring notice about not propping the fire door open that has been there so long it's now just part of the wall.",
        "I had a job interview once where everything went well except the last question, which I completely blanked on, and the interviewer said don't worry and then offered me the job, and I have never stopped wondering what that last question was.",
        "I spent a long weekend at a friend's house in the countryside last summer and by the second day I'd stopped checking my phone voluntarily rather than because I'd told myself not to. That felt like useful information.",
        "There are some places I've only ever been to when I was younger that now exist in my memory with a specific light and temperature that probably isn't accurate but that I'd be reluctant to revisit and correct.",
        "I was helping someone move last month and we found a box at the back of a cupboard neither of us could identify, contents unknown, no label. We agreed to move it without opening it. Some things are like that.",
        "My attention span for long videos has shortened noticeably and I'm not entirely sure whether that's a loss or just adaptation. I haven't decided which framing I prefer yet.",
        "I've realised the things I called hobbies in my twenties were things I was trying to become. Now I think I'm just trying to enjoy things without needing them to be about anything.",
        "There's a specific flavour of regret you feel when you've given someone advice that they followed and it worked out badly. It's different from the regret of not saying anything. I'm not sure which one is worse.",
        "I told a very small lie in a meeting about two months ago to avoid a long explanation and the meeting moved on and nobody questioned it and now I have to maintain a slightly alternate version of that conversation forever.",
        "I get an unreasonable amount of enjoyment from finding a parking space on the first pass. It's a small thing and I know it's a small thing but it genuinely sets a positive tone for whatever comes after.",
        "My partner does this thing where she hums while she's thinking about something else entirely and doesn't seem to be aware she's doing it. I find it oddly reassuring when I can hear it from the other room.",
        "I've started noticing when people use filler words and now I notice when I use them and now I can't stop noticing either and I'm not sure this counts as an improvement.",
        "There are certain songs I can't listen to without being eight years old in the back of my parents' car. The association is completely involuntary and almost too precise.",
        "I missed a friend's birthday this year. Not forgot, missed, there's a difference, and I haven't fully worked out what I'm going to say about it even though I know I need to say something.",
        "The city I grew up in has changed enough in the last fifteen years that when I go back I'm not sure whether I'm seeing it differently or whether it's genuinely a different place. Possibly both.",
        "I had a conversation with someone last week that I suspect will turn out to have been important. I can't say exactly why. It just had a particular quality to it that stayed with me after I got home.",
        "My tolerance for uncertainty has gone up considerably in the last few years. I'm not sure whether I worked at it or whether I just got tired of the alternative.",
        "I've been meaning to call an old friend for about six months. The longer I leave it the more the call needs to justify the gap and the harder it gets. I'm going to call this week. I'm aware I might be saying that again.",
        "There's a version of being busy that's actually just motion without direction and I've caught myself in it enough times now that I can usually recognise it while it's happening, which is at least something."
    ]
};

// Validate configuration on load
(function validateConfig() {
    if (CONFIG.phrases.length === 0) {
        console.warn('Warning: No phrases configured! Please add phrases to config.js');
    }
    
    if (!CONFIG.api.endpoint || CONFIG.api.endpoint.includes('your-api-endpoint')) {
        console.warn('Warning: API endpoint not configured. Please update config.js with your actual endpoint.');
    }
    
    if (CONFIG.recording.maxDuration < CONFIG.recording.minDuration) {
        console.error('Error: maxDuration must be greater than minDuration');
    }
})();
