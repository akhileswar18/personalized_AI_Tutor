import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax) {
      // Clear previous content
      containerRef.current.innerHTML = content;
      
      // Typeset the math
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
        console.error('MathJax typesetting error:', err);
      });
    } else if (containerRef.current) {
      // Fallback if MathJax isn't loaded yet
      containerRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default MathRenderer;
