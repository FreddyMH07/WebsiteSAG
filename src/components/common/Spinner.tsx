interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export default function Spinner({ size = 'md' }: Props) {
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-sag-green border-t-transparent`}
      aria-label="Loading"
    />
  );
}
