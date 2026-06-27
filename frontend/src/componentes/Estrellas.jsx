const Estrellas = ({ valor, onChange, solo_lectura = false, tamano = '1.5rem', color = null }) => {
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => !solo_lectura && onChange && onChange(n)}
          style={{
            fontSize: tamano,
            cursor: solo_lectura ? 'default' : 'pointer',
            color: n <= valor ? (color || 'currentColor') : '#ccc',
            transition: 'color 0.15s',
          }}
        >★</span>
      ))}
    </div>
  );
};

export default Estrellas;
