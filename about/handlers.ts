type Quote = {
    quote: string
    author: string
    citation: string
}

const quotes: Quote[] = [ 
{
    quote: `A complex system that works is invariably found to have evolved 
            from a simple system that worked. 
            The inverse proposition also appears to be true: a complex system designed
            from scratch never works and cannot be made to work. 
            You have to start over, beginning with a simple system.`,   
    author: "John Gall",
    citation: "Systemantics: How Systems Really Work and How They Fail"          
},
{
    quote: `I conclude that there are two ways of constructing a
                        software design: One way is to make it so simple that
                        there are obviously no deficiencies and the other way is
                        to make it so complicated that there are no obvious
                        deficiencies. The first method is far more difficult. 
                        It demands the same skill, devotion, insight, and even inspiration as the discovery 
                        of the simple physical laws which underlie the complex phenomena of nature.`,
    author: "C. A. R. Hoare",
    citation: "Turing Award Lecture, 1980"
},
{
    quote: `Perfection is achieved, not when there is nothing more to add, 
                        but when there is nothing left to take away.`,
    author: "Antoine de Saint-Exupéry",
    citation: "Airman's Odyssey"
},
{
    quote: `In the beginning you always want results. In the end all you want is control.`,
    author: "Eskil Steenberg",
    citation: "How I program C"
},
{
    quote: ` If you do work that compounds, you'll get exponential growth. 
                        Most people who do this do it unconsciously, but it's worth stopping to think about. 
                        Learning, for example, is an instance of this phenomenon: 
                        the more you learn about something, the easier it is to learn more. 
                        Growing an audience is another: the more fans you have, the more new fans they'll bring you.
                        
                        The trouble with exponential growth is that the curve feels flat in the beginning. 
                        It isn't; it's still a wonderful exponential curve. 
                        But we can't grasp that intuitively, so we underrate exponential growth in its early stages.`,
    author: "Paul Graham",
    citation: "How to do Great Work"
},
{
    quote: `This whole idea of "the stack" that people have now. People think it's ok to say like
                        "the stack". I mean yes that's factual that there is a stack of software in some sense,
                        but it's way bigger than it should, by any right, be and it's bad to refer to the "the stack" without 
                        at least whincing inside a little bit...  The picture that is sold to people, including to 
                        professional developers, via their own sense of self-deception, is that this "stack" is a miracle of modern technology and 
                        that it's amazing and great, and really it's actually very embarassing. `,
    author: "Jonathan Blow",
    citation: "Twitch Stream"
},
{
    quote: `Figuring out the right product is the innovator's job, not the customer's job`,
    author: "Ben Horowitz",
    citation: "The Hard Thing About Hard Things"
},
{
    quote: `Low-level things are likely to work correctly
                        since there's tremendous pressure for them to do so.
                        Because otherwise, all the higher-level stuff will collapse, and everybody will go "AAAAAAAAAA!!" 
                        Higher-level things carry less weight. 
                        OK, so five web apps are broken by this browser update 
                        (or an update to a system library used by the browser or any other part of the pyramid). 
                        If your web app broke, your best bet is to fix it, 
                        not to wait until the problem is resolved at the level below. 
                        The higher your level, the loner you become. 
                        Not only do you depend on more stuff that can break, there are less people who care in each particular case.`,
    author: "Yossi Kreinin",
    citation: "Low-level is Easy"
}        
]

export let quotesList = "<div id='quotes-list' style='display: none>"

for (const quote of quotes) {
 const li = `
                <blockquote>
                    <p>
                    ${quote.quote}
                    </p>
                </blockquote>
                <p>—${quote.author}, <cite>${quote.citation}</cite></p>
            
            `

    quotesList += li
}

quotesList += "</div>" 

export function toggleQuotes(div: HTMLDivElement) {
    
    const quotetoggle = document.getElementById("quote-toggle")

    if (!quotetoggle) {
        console.log("failed to get dom nodes")
        return
    } 

    if (quotetoggle.innerHTML !== "show") {
        quotetoggle.innerHTML = "show"
        div.style.display = 'none'
        
    } else {
        quotetoggle.innerHTML = "hide"
        div.style.display = 'block'
    }
}

