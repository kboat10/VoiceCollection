// Configuration file for the voice recording application

const CONFIG = {
    // API Configuration
    api: {
        // Use relative path for proxy - works with both localhost and Cloudflare tunnel
        endpoint: '/api/proxy',
        
        // Target API (used by server-side proxy)
        targetApi: 'http://159.65.185.102/collect',
        
        // Authentication token (if required)
        authToken: '', // Set this if your API requires authentication
        
        // Request timeout in milliseconds
        timeout: 30000,
        
        // Number of retry attempts for failed uploads
        retryAttempts: 3,
        
        // Delay between retry attempts (ms)
        retryDelay: 2000
    },

    // Recording Settings
    recording: {
        // Maximum recording duration in seconds
        maxDuration: 15,
        
        // Audio format - API accepts mp3, wav, or flac
        mimeType: 'audio/wav',
        
        // Sample rate (16000 Hz is good for speech)
        sampleRate: 16000,
        
        // Bit rate for encoding
        audioBitsPerSecond: 128000,
        
        // Silence detection threshold (0-255, lower = more sensitive)
        silenceThreshold: 10,
        
        // Minimum recording duration in seconds
        minDuration: 0.5
    },

    // Session Settings
    session: {
        // Whether to save progress locally for recovery
        enableLocalStorage: true,
        
        // Key prefix for localStorage
        storagePrefix: 'voice_research_',
        
        // Whether to collect demographic data
        collectDemographics: false
    },

    // UI Settings
    ui: {
        // Show waveform visualization during recording
        showWaveform: true,
        
        // Enable practice mode
        enablePracticeMode: true,
        
        // Allow skipping phrases
        allowSkip: true,
        
        // Show break option after N recordings
        breakAfterRecordings: 10
    },

    // Research Study Phrases
    // Phrases specifically designed for speech synthesis and voice recognition testing
    phrases: [
        "The fundamental frequency of a signal is determined by the periodic recurrence of its waveform.",
        "Could you please direct me to the nearest train station? I seem to be a bit lost in this city.",
        "Her laughter echoed through the valley, a sound so pure it felt like it belonged to another world.",
        "The quick brown fox jumps over the lazy dog, while the five boxing wizards jump quickly.",
        "Why is it that the most complex problems often have the most surprisingly simple solutions?",
        "I'll have the grilled salmon with a side of roasted vegetables and a glass of sparkling water, please.",
        "The results of the analysis indicate a statistically significant correlation between humidity and rainfall.",
        "I'm sorry, I cannot fulfill that request because it violates my safety guidelines and ethical programming.",
        "Wait, did you hear that? It sounded like someone was walking on the gravel outside the window.",
        "Welcome to the high-stakes world of international finance, where fortunes are made and lost in seconds.",
        "The weather in Accra today is exceptionally humid, with a high chance of thunderstorms in the evening.",
        "If you want to optimize the loss function, you must first ensure your gradients are not vanishing.",
        "Please stay behind the yellow line while the train is arriving at the platform for your safety.",
        "I used to think that the stars were just pinpricks in a velvet curtain, but now I know they are suns.",
        "Can you help me translate this Twi sentence into English? I am having a bit of trouble with the grammar.",
        "The sunset painted the sky in shades of bruised purple and fiery orange, a masterpiece of nature.",
        "Artificial intelligence is not just about code; it is about understanding the human experience.",
        "The secret ingredient to a perfect Jollof rice is not just the spices, but the love put into the cooking.",
        "Does the model correctly identify the nuances of synthetic speech across different African dialects?",
        "I am currently recording this sample to test the efficacy of a convolutional neural network ensemble.",
        "She sells seashells by the seashore, where the sand sparkles and shimmers in the sunshine.",
        "The assistants processed six thousand census forms with exceptional precision and swift efficiency.",
        "Suspicious circumstances surrounded the mysterious disappearance of the precious sapphire necklace.",
        "The scientist's sensational discovery caused a sensation across the research community worldwide.",
        "Several systems simultaneously crashed, causing serious disruptions to essential services across the city.",
        "The association's asset assessment session suggested substantial fiscal restructuring was necessary.",
        "Scissors, whiskers, and thistles share something special: they showcase sibilant sounds superbly.",
        "Zeus's treasures sit in storage, showcasing centuries of history and civilizations past.",
        "The psychology student's thesis focused on stress responses in social situations and anxious states.",
        "Successive sessions of intensive speech synthesis testing showed satisfactory success rates overall.",
        "The ostensibly simple recipe requires precise measurements and specific techniques for success.",
        "His business strategies successfully seized several substantial opportunities in emerging markets consistently.",
        "The obsessive researcher searched ceaselessly through centuries of census records seeking specific answers.",
        "Sophisticated sensor systems consistently measure atmospheric pressure with astonishing precision and accuracy.",
        "She whispered softly, sharing secrets and special stories about seaside summers spent years ago.",
        "The exercise requires students to distinguish between similar sounds in separate linguistic contexts carefully.",
        "Mississippi's mysterious marshes host diverse species thriving in these special ecosystems successfully.",
        "Stress tests assess whether systems possess sufficient resources to sustain serious usage scenarios.",
        "The zealous parasite specialist investigated disease transmission processes across susceptible populations extensively.",
        "Excessive exposure to substances like asbestos poses serious risks requiring stringent safety measures.",
        "The sociologist's thesis synthesized six seasons of systematic observations into insightful conclusions.",
        "Massachusetts musicians showcased classical compositions, demonstrating exceptional skill and artistic precision throughout.",
        "She seized the opportunity to discuss consciousness, essence, and existence with enthusiastic philosophy students.",
        "The Swiss cheese's distinct taste comes from specific bacterial cultures used during processing stages.",
        "Precise scissors slice through tissue samples, ensuring scientists obtain usable specimens for analysis.",
        "The suspicious witness's testimony was inconsistent, causing prosecutors to reassess their case strategy.",
        "Dense forests surround the city's outskirts, serving as sanctuaries for countless species and ecosystems.",
        "The statistician's comprehensive analysis synthesized massive datasets, revealing surprising insights and patterns consistently.",
        "She seems especially insistent that these specific circumstances necessitate immediate systematic assessment procedures.",
        "The decision to invest resources in synthetic speech systems shows wisdom and foresight.",
        "His conscious choice to pursue justice demonstrates persistence despite facing serious obstacles constantly.",
        "The license requires users to assess risks, ensuring compliance with specified terms and conditions.",
        "Six sassy snakes slithered silently south, seeking sunshine and sustenance in sparse surroundings.",
        "The essence of successful science lies in systematic skepticism and persistent pursuit of precise answers.",
        "Anxious students obsess over assignments, stressed about assessments and successive submission deadlines approaching.",
        "The census shows statistics suggesting cities face serious challenges with housing and resources.",
        "Sophisticated software assists physicians in assessing symptoms and suggesting possible diagnoses for patients.",
        "The specialist's consensus was that successive sessions would assist in stress reduction significantly.",
        "She insists that consistency in practice sessions is essential for sustaining progress and success.",
        "The precious stones sparkled splendidly, their surfaces shimmering with extraordinary brilliance and clarity.",
        "Processing massive datasets simultaneously requires substantial computational resources and sophisticated algorithms consistently.",
        "The physician's assessment suggests that excessive stress adversely affects the cardiovascular system significantly.",
        "Successive civilizations constructed massive structures showcasing sophisticated architectural and engineering skills impressively.",
        "The museum's special exhibition showcases exquisite glasswork pieces spanning six centuries of artistic history.",
        "Circumstances suggest that systematic biases exist within assessment processes, necessitating serious scrutiny immediately.",
        "The synthesis of complex substances requires precision, patience, and strict adherence to specific protocols.",
        "Six exceptional students received scholarships recognizing their academic success and consistent excellence throughout.",
        "The decision-making process involves assessing costs, risks, and potential consequences systematically and thoroughly.",
        "Successive seasons showcased species diversity, demonstrating ecosystems' resilience despite environmental stresses and pressures.",
        "She possesses exceptional skills in synthesizing information from diverse sources into cohesive narratives successfully.",
        "The specialist's prognosis suggests that consistent therapy sessions will assist significantly in successful recovery.",
        "Census statistics reveal disparities in access to essential services across socioeconomic classes consistently.",
        "Sophisticated sensors detect subtle changes in atmospheric pressure, assisting meteorologists in forecasting accuracy.",
        "The psychology researcher's focus centers on stress, consciousness, and decision-making processes in crisis situations.",
        "Successive experiments assessed whether specific substances possess therapeutic properties warranting clinical trials soon.",
        "She seems certain that these circumstances necessitate reassessing assumptions and reconsidering strategic approaches.",
        "The essence of successful synthesis lies in precise measurements and systematic attention to specific details.",
        "Excessive use of resources poses serious sustainability challenges requiring immediate systematic assessment globally.",
        "The city's historic sites showcase architectural styles spanning centuries, preserving cultural significance successfully.",
        "Processing speech samples requires sophisticated software systems capable of handling diverse acoustic characteristics consistently.",
        "The specialist insists that successive assessments are essential for monitoring progress and adjusting strategies.",
        "Six scientists simultaneously discovered similar solutions, suggesting certain principles possess universal significance remarkably.",
        "Circumstances surrounding the crisis suggest systematic failures across multiple organizational levels consistently.",
        "The physician stresses that consistent exercise significantly assists in sustaining cardiovascular health successfully.",
        "Successive civilizations possessed sophisticated astronomical knowledge, showcasing impressive scientific achievements considering constraints.",
        "She assesses situations swiftly, demonstrating exceptional decision-making skills under serious pressure consistently.",
        "The psychologist's research synthesizes insights from neuroscience, sociology, and statistics into cohesive frameworks.",
        "Census responses suggest substantial shifts in societal attitudes across successive generations remarkably.",
        "Sophisticated systems simultaneously process thousands of requests, ensuring seamless service despite massive usage.",
        "The essence of consciousness remains mysterious, fascinating scientists and philosophers across centuries persistently.",
        "Excessive stress adversely affects decision-making processes, causing suboptimal choices in critical circumstances frequently.",
        "Six successive sessions focused on specific techniques for stress reduction and sustaining psychological wellness.",
        "The specialist's assessment suggests that consistent practice sessions will assist in skill acquisition significantly.",
        "Circumstances necessitate reassessing strategies, considering resources, risks, and potential consequences systematically always.",
        "Processing census statistics reveals surprising insights into societal structures and socioeconomic disparities consistently.",
        "She seems especially skilled at synthesizing complex information into accessible narratives for diverse audiences.",
        "The decision to pursue systematic research shows wisdom, persistence, and commitment to scientific excellence.",
        "Successive experiments assessed whether specific circumstances influence decision-making processes significantly or subtly.",
        "Six museums showcase spectacular collections spanning centuries, preserving artistic and historical significance successfully.",
        "The psychologist insists that excessive stress seriously impairs consciousness and cognitive processing capabilities consistently.",
        "Sophisticated speech synthesis systems possess impressive capabilities, showcasing substantial technological advances recently."
    ],

    // Metadata to include with each recording
    metadata: {
        // Project identifier
        projectId: 'voice_research_2024',
        
        // Version of the data collection app
        appVersion: '1.0.0',
        
        // Additional custom fields (optional)
        customFields: {}
    }
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
