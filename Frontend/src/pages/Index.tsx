import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import Sidebar from '@/components/Sidebar';
import ThemeProvider from '@/components/ThemeProvider';

type Theme = 'cyberpunk' | 'matrix' | 'minimal' | 'basic' | 'girly';

const Index = () => {
  const [theme, setTheme] = useState<Theme>('basic');
  const [code, setCode] = useState(`#include <stdio.h>
int main() {
    return 0;
}`);
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationSuccess, setCompilationSuccess] = useState<boolean | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context for sound effects
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  const playSound = (frequency: number, duration: number, type: 'success' | 'error') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type === 'success' ? 'sine' : 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const getThemeFont = () => {
    return theme === 'cyberpunk' ? 'font-cyber' :
           theme === 'matrix' ? 'font-code' :
           theme === 'basic' ? 'font-basic' :
           theme === 'girly' ? 'font-girly' :
           'font-cyber';
  };

  const getThemeBackground = () => {
    return theme === 'cyberpunk' ? 'bg-gradient-to-br from-cyber-dark via-cyber-darker to-cyber-gray' :
           theme === 'matrix' ? 'bg-black matrix-bg' :
           theme === 'basic' ? 'basic-bg' :
           theme === 'girly' ? 'girly-bg' :
           'minimal-bg';
  };

  const getHeaderClass = () => {
    const baseClass = "border-b p-4";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} glass-panel border-neon-blue/20`;
    } else if (theme === 'matrix') {
      return `${baseClass} glass-panel border-neon-green/20`;
    } else if (theme === 'basic') {
      return `${baseClass} basic-panel border-basic-blue/20`;
    } else if (theme === 'girly') {
      return `${baseClass} girly-panel border-girly-pink/20`;
    } else {
      return `${baseClass} glass-panel border-neon-blue/20`;
    }
  };

  const getTitleClass = () => {
    const baseClass = "text-3xl font-black tracking-wider";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} text-neon-blue animate-neon-flicker`;
    } else if (theme === 'matrix') {
      return `${baseClass} text-neon-green`;
    } else if (theme === 'basic') {
      return `${baseClass} text-basic-dark`;
    } else if (theme === 'girly') {
      return `${baseClass} text-girly-rose animate-bounce-soft`;
    } else {
      return `${baseClass} text-white`;
    }
  };

  const getCardClass = (accent: 'blue' | 'violet') => {
    const baseClass = "h-full overflow-hidden";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} glass-panel border-neon-${accent}/30`;
    } else if (theme === 'matrix') {
      return `${baseClass} glass-panel border-neon-green/30`;
    } else if (theme === 'basic') {
      return `${baseClass} basic-panel border-basic-blue/30`;
    } else if (theme === 'girly') {
      return `${baseClass} girly-panel border-girly-${accent === 'blue' ? 'pink' : 'rose'}/30`;
    } else {
      return `${baseClass} glass-panel border-neon-${accent}/30`;
    }
  };

  const getCompileButtonClass = () => {
    const baseClass = `px-8 py-4 text-lg font-bold rounded-lg transition-all duration-300 ${isCompiling ? 'animate-compile-pulse' : 'hover:scale-105'}`;
    
    if (theme === 'cyberpunk') {
      return `${baseClass} bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-violet hover:to-neon-blue border-2 border-neon-blue neon-glow`;
    } else if (theme === 'matrix') {
      return `${baseClass} bg-gradient-to-r from-neon-green to-green-600 hover:from-green-600 hover:to-neon-green border-2 border-neon-green`;
    } else if (theme === 'basic') {
      return `${baseClass} bg-gradient-to-r from-basic-blue to-blue-600 hover:from-blue-600 hover:to-basic-blue border-2 border-basic-blue basic-shadow`;
    } else if (theme === 'girly') {
      return `${baseClass} bg-gradient-to-r from-girly-pink to-girly-rose hover:from-girly-rose hover:to-girly-pink border-2 border-girly-pink girly-glow`;
    } else {
      return `${baseClass} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600`;
    }
  };

  const compileCode = async () => {
    setIsCompiling(true);
    setOutput('');
    setCompilationSuccess(null);
    setWaitingForInput(false);

    try {
      const response = await fetch('http://localhost:5000/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      setOutput(result.output);
      setCompilationSuccess(result.success);

      if (result.success) {
        toast({
          title: "Compilation Successful! ⚡",
          description: "Your C code has been compiled to ARMv8 assembly.",
        });
      } else {
        toast({
          title: "Compilation Failed ❌",
          description: "There are errors in your code. Check the console output.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during compilation:", error);
      setOutput("An error occurred during compilation.");
      setCompilationSuccess(false);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleUserInput = (input: string) => {
  // If you want, implement interactive input handling here.
  // Currently, this function is a placeholder because interactive input is not supported.
};


  const loadSampleCode = () => {
    const samples = [
      `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) 
        return 1;
    return n * factorial(n - 1);
}

int main() {
    int num = 5;
    printf("Factorial of %d is %d\\n", num, factorial(num));
    return 0;
}`,
      `#include <stdio.h>

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
    }
    
    printf("Array sum: %d\\n", sum);
    return 0;
}`,
      `#include <stdio.h>
#include <string.h>

int main() {
    char str[] = "Hello, ToARM!";
    int len = strlen(str);
    
    printf("String: %s\\n", str);
    printf("Length: %d\\n", len);
    return 0;
}`,
      `#include <stdio.h>

int main() {
    int a, b;
    
    printf("Enter first number: ");
    scanf("%d", &a);
    
    printf("Enter second number: ");
    scanf("%d", &b);
    
    printf("Sum: %d\\n", a + b);
    printf("Product: %d\\n", a * b);
    return 0;
}`
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setCode(randomSample);
    
    toast({
      title: "Sample Code Loaded! 📝",
      description: "A new code sample has been loaded into the editor.",
    });
  };

  const resetEditor = () => {
    setCode('');
    setOutput('');
    setCompilationSuccess(null);
    setWaitingForInput(false);
    
    toast({
      title: "Editor Reset! 🔄",
      description: "The editor has been cleared.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.c')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        toast({
          title: "File Uploaded! 📁",
          description: `${file.name} has been loaded into the editor.`,
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File Type ❌",
        description: "Please upload a .c file.",
        variant: "destructive",
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={`min-h-screen ${getThemeFont()} transition-all duration-500 ${getThemeBackground()}`}>
        {/* Header */}
        <header className={getHeaderClass()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className={getTitleClass()}>
                ⚡ ToARM
              </h1>
              <span className="text-sm text-gray-400">
                {theme === 'basic' ? 'Simple C to ARM Compiler' :
                 theme === 'girly' ? 'Cute C to ARM Compiler ✨' :
                 'Cyberpunk C to ARM Compiler'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                <SelectTrigger className={`w-40 ${theme === 'basic' ? 'basic-panel border-basic-blue/50' : theme === 'girly' ? 'girly-panel border-girly-pink/50' : 'glass-panel border-neon-violet/50'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`${theme === 'basic' ? 'basic-panel border-basic-blue/50' : theme === 'girly' ? 'girly-panel border-girly-pink/50' : 'glass-panel border-neon-violet/50'}`}>
                  <SelectItem value="cyberpunk">🌆 Cyberpunk</SelectItem>
                  <SelectItem value="matrix">🔢 Matrix</SelectItem>
                  <SelectItem value="basic">⚪ Basic</SelectItem>
                  <SelectItem value="girly">💕 Girly</SelectItem>
                  <SelectItem value="minimal">✨ Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <Sidebar
            onFileUpload={handleFileUpload}
            onLoadSample={loadSampleCode}
            onReset={resetEditor}
            theme={theme}
          />

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Code Editor Panel */}
            <div className="flex-1 p-4">
              <Card className={getCardClass('blue')}>
                <div className="h-full flex flex-col">
                  <div className={`p-3 border-b flex items-center justify-between ${
                    theme === 'cyberpunk' ? 'border-neon-blue/20 bg-cyber-gray/50' :
                    theme === 'matrix' ? 'border-neon-green/20 bg-black/50' :
                    theme === 'basic' ? 'border-basic-blue/20 bg-gray-50' :
                    theme === 'girly' ? 'border-girly-pink/20 bg-pink-50/30' :
                    'border-neon-blue/20 bg-white/10'
                  }`}>
                    <h2 className={`font-semibold ${
                      theme === 'cyberpunk' ? 'text-neon-blue' :
                      theme === 'matrix' ? 'text-neon-green' :
                      theme === 'basic' ? 'text-basic-dark' :
                      theme === 'girly' ? 'text-girly-rose' :
                      'text-white'
                    }`}>
                      C Source Code
                    </h2>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    theme={theme}
                  />
                </div>
              </Card>
            </div>

            {/* Output Panel */}
            <div className="flex-1 p-4">
              <Card className={getCardClass('violet')}>
                <div className="h-full flex flex-col">
                  <div className={`p-3 border-b flex items-center justify-between ${
                    theme === 'cyberpunk' ? 'border-neon-violet/20 bg-cyber-gray/50' :
                    theme === 'matrix' ? 'border-neon-green/20 bg-black/50' :
                    theme === 'basic' ? 'border-basic-blue/20 bg-gray-50' :
                    theme === 'girly' ? 'border-girly-rose/20 bg-pink-50/30' :
                    'border-neon-violet/20 bg-white/10'
                  }`}>
                    <h2 className={`font-semibold ${
                      theme === 'cyberpunk' ? 'text-neon-violet' :
                      theme === 'matrix' ? 'text-neon-green' :
                      theme === 'basic' ? 'text-basic-dark' :
                      theme === 'girly' ? 'text-girly-rose' :
                      'text-white'
                    }`}>
                      {waitingForInput ? 'Program Output & Input' : 'ARM Assembly Output'}
                    </h2>
                    {compilationSuccess !== null && (
                      <div className={`px-2 py-1 rounded text-xs ${
                        compilationSuccess 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {compilationSuccess ? '✅ SUCCESS' : '❌ ERROR'}
                      </div>
                    )}
                  </div>
                  
                  <ConsoleOutput
                    output={output}
                    isCompiling={isCompiling}
                    success={compilationSuccess}
                    theme={theme}
                    onUserInput={handleUserInput}    // <- corrected prop and function name
                    waitingForInput={waitingForInput}
                    inputPrompt={inputPrompt}
                  />

                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Floating Compile Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={compileCode}
            disabled={isCompiling || waitingForInput}
            className={getCompileButtonClass()}
          >
            {isCompiling ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Compiling...
              </>
            ) : waitingForInput ? (
              <>
                {theme === 'girly' ? '💬 Running...' : '⚙️ Running...'}
              </>
            ) : (
              <>
                {theme === 'girly' ? '💖 Compile' : '⚡ Compile'}
              </>
            )}
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
