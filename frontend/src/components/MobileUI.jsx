import { Text } from '@radix-ui/themes';

export function MobileSection({ title, action, children, className = '' }) {
  return (
    <section className={`mobile-section ${className}`.trim()}>
      {(title || action) && (
        <div className="section-header">
          {title && (
            <Text size="1" weight="bold" className="section-title">
              {title}
            </Text>
          )}
          {action}
        </div>
      )}
      <div className="mobile-group">{children}</div>
    </section>
  );
}

export function MobileListItem({ name, subtitle, meta, trailing, children }) {
  return (
    <div className="mobile-list-item">
      <div className="list-item-body">
        <div className="list-item-main">
          <Text weight="medium" size="2" className="list-item-name">
            {name}
          </Text>
          {subtitle && (
            <Text size="1" color="gray" className="list-item-sub">
              {subtitle}
            </Text>
          )}
          {meta}
          {children}
        </div>
        {trailing && <div className="list-item-trailing">{trailing}</div>}
      </div>
    </div>
  );
}

export function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="segmented-control" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`segment${value === opt.value ? ' active' : ''}${opt.className ? ` ${opt.className}` : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function StatPill({ label, value, accent }) {
  return (
    <div className={`stat-pill${accent ? ' accent' : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state-mobile">
      <p className="empty-title">{title}</p>
      {subtitle && <p className="empty-subtitle">{subtitle}</p>}
    </div>
  );
}

export function MobileSheetContent({ children, ...props }) {
  return (
    <div className="mobile-sheet-wrap">
      <div className="sheet-handle" />
      <div className="mobile-sheet-body">{children}</div>
    </div>
  );
}
