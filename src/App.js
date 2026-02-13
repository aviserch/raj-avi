import { useState, useEffect, useRef } from 'react';
import './App.css';
import img001 from './images/image_part_001.jpg';
import img002 from './images/image_part_002.jpg';
import img003 from './images/image_part_003.jpg';
import img004 from './images/image_part_004.jpg';
import img005 from './images/image_part_005.jpg';
import img006 from './images/image_part_006.jpg';
import img007 from './images/image_part_007.jpg';
import img008 from './images/image_part_008.jpg';
import img009 from './images/image_part_009.jpg';

// Puzzle pieces in correct order: row1 001,002,003 | row2 004,005,006 | row3 007,008,009
const PUZZLE_IMAGES = [img001, img002, img003, img004, img005, img006, img007, img008, img009];

const CORRECT_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const KEYPAD = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

const CORRECT_PASSWORD = '456838';
const MAX_DIGITS = 6;

function App() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [order, setOrder] = useState(() => shuffle(CORRECT_ORDER));
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [doneFeedback, setDoneFeedback] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [dragSlot, setDragSlot] = useState(null);
  const [pieceAspectRatio, setPieceAspectRatio] = useState(null);
  const [envelopeStage, setEnvelopeStage] = useState(0); // 0 = closed, 1 = first fold open, 2 = letter out
  const orderRef = useRef(order);
  orderRef.current = order;

  useEffect(() => {
    if (!unlocked) return;
    const img = new Image();
    img.src = PUZZLE_IMAGES[0];
    img.onload = () => {
      setPieceAspectRatio(img.naturalWidth / img.naturalHeight);
    };
  }, [unlocked]);

  useEffect(() => {
    if (code.length === 6) {
      if (code === CORRECT_PASSWORD) {
        setUnlocked(true);
        setPasswordError(null);
      } else {
        setPasswordError('Wrong password. Try again.');
      }
    }
  }, [code]);

  const onKey = (digit) => {
    if (digit === '*' || digit === '#') return;
    if (code.length >= MAX_DIGITS) return;
    setCode((prev) => prev + digit);
  };

  const onBackspace = () => {
    setPasswordError(null);
    setCode((prev) => prev.slice(0, -1));
  };

  const goBackToPassword = () => {
    setUnlocked(false);
    setCode('');
    setPasswordError(null);
  };

  const goBackToPuzzle = () => {
    setPuzzleSolved(false);
    setEnvelopeStage(0);
    const newOrder = shuffle(CORRECT_ORDER);
    orderRef.current = newOrder;
    setOrder(newOrder);
  };

  const onPuzzleDragStart = (e, slotIndex) => {
    setDragSlot(slotIndex);
    setDoneFeedback(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(slotIndex));
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const onPuzzleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onPuzzleDrop = (e, targetSlot) => {
    e.preventDefault();
    if (dragSlot === null || dragSlot === targetSlot) {
      setDragSlot(null);
      return;
    }
    const fromSlot = dragSlot;
    setOrder((prev) => {
      const next = [...prev];
      next[fromSlot] = prev[targetSlot];
      next[targetSlot] = prev[fromSlot];
      orderRef.current = next;
      return next;
    });
    setDragSlot(null);
  };

  const onPuzzleDragEnd = () => {
    setDragSlot(null);
  };

  const onDoneClick = () => {
    const currentOrder = orderRef.current;
    if (!currentOrder || currentOrder.length !== 9) {
      setDoneFeedback('Not quite! Keep trying.');
      return;
    }
    const correct = currentOrder.every((piece, slotIndex) => {
      const p = Number(piece);
      return p === slotIndex;
    });
    if (correct) {
      setPuzzleSolved(true);
      setDoneFeedback(null);
    } else {
      setDoneFeedback('Not quite! Keep trying.');
    }
  };

  if (unlocked && puzzleSolved) {
    return (
      <div className="app">
        <div className="card card--envelope">
          <button type="button" className="back-btn" onClick={goBackToPuzzle} aria-label="Back">
            ← Back
          </button>
          <h1 className="card-title">
            {envelopeStage === 0 ? 'Tap the envelope' : envelopeStage === 1 ? 'Tap again' : ''}
          </h1>
          <button
            type="button"
            className="envelope-wrap"
            onClick={() => {
              if (envelopeStage < 2) setEnvelopeStage((s) => s + 1);
            }}
          >
            <div className={`envelope ${envelopeStage >= 1 ? 'envelope--open' : ''}`}>
              <div className="envelope-body" />
              <div className="envelope-flap" />
              <div className="envelope-seal">♥</div>
            </div>
          </button>
          {envelopeStage >= 2 && (
            <div className="envelope-card">
              <p className="envelope-card-salutation">To my most beloved Rajvi,</p>
              <p className="envelope-card-body">
                Though I have not the quill of Shakespeare, my heart speaks in the same tongue. I feeleth did bless to beest able to spendeth one m're valentine's day with thee.  And i desire to bray out m're.  Thou art mine own most wondrous thing in the w'rld, mine own sunshine, mine own angel.  I desire thee knoweth i loveth thee with all mine own heart and soul.  Keepeth shining mine own cute bright lighteth.
              </p>
              <p className="envelope-card-body">
                Happy Valentine's Day. With all my love, now and ever.
              </p>
              <p className="envelope-card-signature">— Yours, always</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (unlocked) {
    return (
      <div className="app">
        <div className="card card--puzzle">
          <button type="button" className="back-btn" onClick={goBackToPassword} aria-label="Back">
            ← Back
          </button>
          <h1 className="card-title">Finish the puzzle</h1>
          <>
              <p className="card-subtitle">Drag pieces to swap them. Arrange the image, then click Done.</p>
              <div
                className="puzzle-grid"
                style={pieceAspectRatio != null ? { '--piece-aspect': pieceAspectRatio } : undefined}
              >
                {order.map((pieceIndex, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`puzzle-slot ${dragSlot === slotIndex ? 'puzzle-slot--dragging' : ''}`}
                    draggable
                    onDragStart={(e) => onPuzzleDragStart(e, slotIndex)}
                    onDragOver={onPuzzleDragOver}
                    onDrop={(e) => onPuzzleDrop(e, slotIndex)}
                    onDragEnd={onPuzzleDragEnd}
                  >
                    <img
                      src={PUZZLE_IMAGES[pieceIndex]}
                      alt={`Piece ${pieceIndex + 1}`}
                      className="puzzle-piece"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
              {doneFeedback && <p className="puzzle-feedback">{doneFeedback}</p>}
              <button type="button" className="puzzle-done" onClick={onDoneClick}>
                Done
              </button>
            </>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="card">
        <div className="card-heart">♥</div>
        <h1 className="card-title">Happy Valentines Day Maya!!</h1>
        <p className="card-subtitle">Guess the password. Hint: what you do.</p>
        <div className="passcode-display">
          {Array.from({ length: MAX_DIGITS }).map((_, i) => (
            <span key={i} className={`dot ${i < code.length ? 'filled' : ''}`} />
          ))}
        </div>
        {passwordError && <p className="password-error">{passwordError}</p>}
        <div className="keypad">
          {KEYPAD.map(({ digit, letters }) => (
            <button
              key={digit}
              type="button"
              className="keypad-key"
              onClick={() => onKey(digit)}
              disabled={digit === '*' || digit === '#'}
            >
              <span className="key-digit">{digit}</span>
              {letters && <span className="key-letters">{letters}</span>}
            </button>
          ))}
          <button type="button" className="keypad-key key-backspace" onClick={onBackspace} aria-label="Delete">
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
