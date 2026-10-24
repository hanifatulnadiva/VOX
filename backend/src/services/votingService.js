const supabase = require('../config/supabase');

const verifyMahasiswaDB = async (nim, wallet_address) => {
    const { data, error } = await supabase
        .from('mahasiswa')
        .select('*')
        .eq('nim', nim)
        .single();

    if (error || !data) {
        throw new Error("NIM tidak terdaftar dalam sistem.");
    }

    if (!data.is_eligible) {
        throw new Error("Anda tidak memiliki hak akses untuk voting.");
    }

    if (data.has_voted) {
        throw new Error("Anda sudah melakukan voting sebelumnya.");
    }

    if (!data.wallet_address && wallet_address) {
        await supabase
            .from('mahasiswa')
            .update({ wallet_address: wallet_address })
            .eq('nim', nim);
    }

    return { nama: data.nama, nim: data.nim };
};

const updateVotedStatusDB = async (nim) => {
    const { error } = await supabase
        .from('mahasiswa')
        .update({ has_voted: true })
        .eq('nim', nim);

    if (error) throw new Error("Gagal memperbarui status voting.");
    return true;
};

module.exports = { verifyMahasiswaDB, updateVotedStatusDB };