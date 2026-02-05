const DEFAULT_LOADING = "lazy";
const DEFAULT_DECODING = "async";

export default function OptimizedImage({
  loading = DEFAULT_LOADING,
  decoding = DEFAULT_DECODING,
  fetchPriority,
  ...props
}) {
  return (
    <img
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      {...props}
    />
  );
}
